import { NextRequest, NextResponse } from "next/server";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { connectDB } from "@/lib/db";
import { getSession, createSession, updateSession } from "@/models/session";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import libre from "libreoffice-convert";
import util from "util";
import axios from "axios";
import FormData from "form-data"; // <-- Add this import
import mammoth from "mammoth";
import puppeteer from "puppeteer";

export const runtime = "nodejs"; // Switch to Node.js runtime

export async function POST(request: NextRequest, { params }) {
  //connecting to the database
  await connectDB();
  //user authentication
  const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
  const token = request.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
    console.log("Decoded userId:", userId);
  } catch {
    console.error("Invalid token");
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  try {
    const session = await getSession(userId);
    const standard = JSON.stringify(session.standard);
    const interimIndicators = JSON.stringify(session.interimIndicators);
    const finalIndicators = JSON.stringify(session.finalIndicators);
    const keyCompetencies = Object.values(session.keyCompetencies).map(
      (value) => ({
        item: value,
      })
    );
    const content = Object.values(session.content).map((value) => ({
      item: value,
    }));
    console.log("interimIndicators:", interimIndicators);
    console.log("finalIndicators:", finalIndicators);
    console.log("standard:", standard);
    console.log("keyCompetencies:", keyCompetencies);
    console.log("content:", content);

    //---------------- Template Format ----------------
    // Load the docx file as binary
    const file = fs.readFileSync(
      path.resolve(process.cwd() + "/src/data/curriculum_template.docx"),
      "binary"
    );

    // Create a PizZip instance
    const zip = new PizZip(file);

    // Create a docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.setData({
      interimIndicators: interimIndicators,
      standard: standard,
      keyCompetencies: keyCompetencies,
    });

    try {
      // Render the document (replace all occurrences of {name} and loop over {#items}{item}{/items})
      doc.render();
    } catch (error) {
      console.error(error);
      throw error;
    }

    // Generate the output docx
    const buf = doc.getZip().generate({ type: "nodebuffer" });

    // Write the generated docx to file
    const docxPath = path.resolve(
      process.cwd() + `/src/data/output_${userId}.docx`
    );
    fs.writeFileSync(docxPath, buf);

    // Convert DOCX to HTML using mammoth
    const { value: html } = await mammoth.convertToHtml({ path: docxPath });

    // Launch Puppeteer to convert HTML to PDF
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuf = await page.pdf({ format: "A4" });
    await browser.close();

    // Set appropriate headers for PDF download
    const response = new NextResponse(
      pdfBuf,
      {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=output_${userId}.pdf`,
        },
      },
    );

    // Delete the output docx file
    fs.unlinkSync(docxPath);

    return response;
  } catch (error) {
    console.error("Error generating document:", error);
    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}
