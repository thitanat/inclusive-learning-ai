import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function getSession(userId: string) {
  const db = await connectDB();
  return await db.collection("sessions").findOne({userId: new ObjectId(userId) });
}

export async function getSessionsByUserId(userId) {
  const db = await connectDB();
  return await db.collection("sessions").find({ userId }).toArray();
}

export async function createSession(sessionData: any) {
  const db = await connectDB();
  return await db.collection("sessions").insertOne(sessionData);
}

export async function updateSession(userId: string, updateData: any) {
  const db = await connectDB();
  return await db.collection("sessions").updateOne(
    { userId, userId: new ObjectId(userId) },
    { $set: updateData },
    { upsert: true }
  );
}

export async function deleteSession(userId: string) {
  const db = await connectDB();
  return await db.collection("sessions").deleteMany({ userId: new ObjectId(userId) });
}

export async function getSessionById(sessionId: string) {
  const db = await connectDB();
  return await db.collection("sessions").findOne({ _id: new ObjectId(sessionId) });
}

export async function updateSessionById(sessionId: string, updateData: any) {
  const db = await connectDB();
  return await db.collection("sessions").updateOne(
    { _id: new ObjectId(sessionId) },
    { $set: updateData }
  );
}

export async function deleteSessionById(sessionId: string) {
  const db = await connectDB();
  return await db.collection("sessions").deleteOne({ _id: new ObjectId(sessionId) });
}

export async function getAllSession() {
  const db = await connectDB();
  return await db.collection("sessions").find({}).toArray();
}
