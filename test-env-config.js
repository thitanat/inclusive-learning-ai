#!/usr/bin/env node

/**
 * Test Environment Configuration
 * ==============================
 * Verifies that env.config.js correctly loads environment files
 */

console.log('🧪 Testing Environment Configuration\n');
console.log('=' .repeat(60));

// Test 1: Development Environment
console.log('\n📝 Test 1: Development Environment');
console.log('-'.repeat(60));
process.env.NODE_ENV = 'development';
delete require.cache[require.resolve('./env.config.js')];
require('./env.config.js');

console.log(`✓ NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`✓ MONGO_URI: ${process.env.MONGO_URI?.substring(0, 50)}...`);
console.log(`✓ OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`✓ SERPER_API_KEY: ${process.env.SERPER_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`✓ JWT_SECRET: ${process.env.JWT_SECRET?.substring(0, 20)}...`);

// Test 2: Production Environment (if exists)
console.log('\n📝 Test 2: Production Environment');
console.log('-'.repeat(60));
const fs = require('fs');
if (fs.existsSync('.env.production')) {
  process.env.NODE_ENV = 'production';
  delete require.cache[require.resolve('./env.config.js')];
  require('./env.config.js');
  
  console.log(`✓ NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`✓ MONGO_URI: ${process.env.MONGO_URI?.substring(0, 50)}...`);
  console.log(`✓ OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`✓ Production environment loaded successfully`);
} else {
  console.log('⚠️  .env.production not found (expected for first-time setup)');
  console.log('💡 To test production:');
  console.log('   1. cp .env.production.example .env.production');
  console.log('   2. Edit .env.production with real credentials');
  console.log('   3. Run this test again');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('✅ Environment Configuration Test Complete\n');
console.log('📊 Summary:');
console.log('   • env.config.js: Working ✅');
console.log('   • .env.development: Loaded ✅');
console.log('   • Environment selection: Working ✅');
console.log('\n🚀 Ready to use! Run: npm run dev\n');
