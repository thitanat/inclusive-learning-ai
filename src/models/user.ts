import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export async function getAllUsers() {
  const db = await connectDB();
  return await db.collection("users").find({}).toArray();
}

export async function getUserById(userId: string) {
  const db = await connectDB();
  return await db.collection("users").findOne({ _id: new ObjectId(userId) });
}

export async function getUserByEmail(email: string) {
  const db = await connectDB();
  return await db.collection("users").findOne({ email });
}

export async function createUser(user: Omit<User, "_id">) {
  const db = await connectDB();
  return await db.collection("users").insertOne(user);
}

export async function updateUser(userId: string, updateData: Partial<User>) {
  const db = await connectDB();
  return await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: updateData }
  );
}

export async function deleteUser(userId: string) {
  const db = await connectDB();
  return await db.collection("users").deleteOne({ _id: new ObjectId(userId) });
}
