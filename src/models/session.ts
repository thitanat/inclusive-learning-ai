import { connectDB } from "../lib/db";

export async function getSession(sessionId) {
  const db = await connectDB();
  return await db.collection("sessions").findOne({ sessionId });
}

export async function createSession(sessionData) {
  const db = await connectDB();
  return await db.collection("sessions").insertOne(sessionData);
}

export async function updateSession(sessionId, updateData) {
  const db = await connectDB();
  return await db.collection("sessions").updateOne(
    { sessionId },
    { $set: updateData },
    { upsert: true } // Create if not exists
  );
}
