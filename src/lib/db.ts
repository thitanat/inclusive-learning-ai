import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "inclusive";

let client: MongoClient | null = null;
let db: Db | null = null;

// Connection options for improved performance and reliability
const mongoOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
};

/**
 * Connect to MongoDB with retry logic
 * Supports both MongoDB Atlas and local Docker instances
 */
export async function connectDB(): Promise<Db> {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not defined");
  }

  // Return existing connection if available
  if (client && db) {
    try {
      // Verify connection is still alive
      await client.db("admin").command({ ping: 1 });
      return db;
    } catch (error) {
      console.warn("⚠️  Existing connection failed, reconnecting...");
      client = null;
      db = null;
    }
  }

  // Attempt to connect with retry logic
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Connecting to MongoDB (attempt ${attempt}/${maxRetries})...`);
      
      client = new MongoClient(MONGO_URI, mongoOptions);
      await client.connect();
      db = client.db(DB_NAME);
      
      // Verify connection
      await db.command({ ping: 1 });
      
      const connectionType = MONGO_URI.includes("mongodb+srv") ? "MongoDB Atlas" : "Local MongoDB";
      console.log(`✅ Connected to ${connectionType}: ${DB_NAME}`);
      
      return db;
    } catch (error) {
      lastError = error as Error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Connection attempt ${attempt} failed:`, errorMessage);
      
      // Clean up failed connection
      if (client) {
        try {
          await client.close();
        } catch (closeError) {
          // Ignore close errors
        }
      }
      client = null;
      db = null;
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw new Error(
    `Failed to connect to MongoDB after ${maxRetries} attempts: ${lastError?.message}`
  );
}

/**
 * Gracefully close MongoDB connection
 * Should be called on application shutdown
 */
export async function closeDB(): Promise<void> {
  if (client) {
    try {
      await client.close();
      console.log("✅ MongoDB connection closed");
    } catch (error) {
      console.error("❌ Error closing MongoDB connection:", error);
    } finally {
      client = null;
      db = null;
    }
  }
}

// Graceful shutdown handlers
if (process.env.NODE_ENV !== "production") {
  process.on("SIGINT", async () => {
    await closeDB();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await closeDB();
    process.exit(0);
  });
}
