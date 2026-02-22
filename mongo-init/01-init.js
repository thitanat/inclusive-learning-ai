// MongoDB Initialization Script for Inclusive Learning AI Platform
// This script runs automatically when the MongoDB container starts for the first time
// It creates the database, collections, and necessary indexes

print('🚀 Starting MongoDB initialization for Inclusive Learning AI...');

// Switch to the inclusive database
db = db.getSiblingDB('inclusive');

print('📦 Creating collections and indexes...');

// ============================================
// USERS COLLECTION
// ============================================
print('  → Creating users collection...');
db.createCollection('users');

// Unique index on email (prevents duplicate registrations)
db.users.createIndex(
  { email: 1 },
  { unique: true, name: 'email_unique_idx' }
);

// Index for sorting users by creation date (admin dashboard)
db.users.createIndex(
  { createdAt: -1 },
  { name: 'createdAt_idx' }
);

print('  ✅ Users collection created with 2 indexes');

// ============================================
// SESSIONS COLLECTION
// ============================================
print('  → Creating sessions collection...');
db.createCollection('sessions');

// Compound index for fetching user sessions sorted by date
db.sessions.createIndex(
  { userId: 1, createdAt: -1 },
  { name: 'userId_createdAt_idx' }
);

// Compound index for filtering by subject and level
db.sessions.createIndex(
  { subject: 1, level: 1 },
  { name: 'subject_level_idx' }
);

// Text index for searching lesson topics
db.sessions.createIndex(
  { lessonTopic: "text" },
  { name: 'lessonTopic_text_idx' }
);

// Index on session ID for quick lookups
db.sessions.createIndex(
  { _id: 1 },
  { name: 'sessionId_idx' }
);

print('  ✅ Sessions collection created with 4 indexes');

// ============================================
// FINETUNE_DATA COLLECTION
// ============================================
print('  → Creating finetune_data collection...');
db.createCollection('finetune_data');

// Compound index for fetching user feedback sorted by timestamp
db.finetune_data.createIndex(
  { userId: 1, timestamp: -1 },
  { name: 'userId_timestamp_idx' }
);

// Index for filtering by quality label (used in aggregation)
db.finetune_data.createIndex(
  { "metadata.qualityLabel": 1 },
  { name: 'qualityLabel_idx' }
);

// Index for sorting/filtering by overall score
db.finetune_data.createIndex(
  { "feedback.overallScore": -1 },
  { name: 'overallScore_idx' }
);

// Index on session ID for lookups
db.finetune_data.createIndex(
  { sessionId: 1 },
  { name: 'sessionId_idx' }
);

print('  ✅ Finetune_data collection created with 4 indexes');

// ============================================
// VERIFICATION
// ============================================
print('\n📊 Database initialization complete!');
print('   Database: inclusive');
print('   Collections created: 3');
print('   Total indexes: 10');

print('\n🔍 Collection details:');
print('   - users: ' + db.users.countDocuments() + ' documents');
print('   - sessions: ' + db.sessions.countDocuments() + ' documents');
print('   - finetune_data: ' + db.finetune_data.countDocuments() + ' documents');

print('\n✅ MongoDB is ready for the Inclusive Learning AI Platform!');
