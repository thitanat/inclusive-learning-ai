/**
 * Environment Configuration Loader
 * ================================
 * Automatically loads the correct .env file based on NODE_ENV
 * 
 * Priority:
 * 1. .env.{NODE_ENV} (e.g., .env.development, .env.production)
 * 2. .env (fallback)
 * 
 * Usage:
 * - Import at the top of your entry file (e.g., server.js or next.config.js)
 * - Environment variables will be automatically loaded before application startup
 */

const fs = require('fs');
const path = require('path');

// Determine the environment (default to 'development')
const nodeEnv = process.env.NODE_ENV || 'development';

// Construct the environment-specific file name
const envFile = `.env.${nodeEnv}`;
const envPath = path.resolve(process.cwd(), envFile);
const fallbackPath = path.resolve(process.cwd(), '.env');

// Check if environment-specific file exists
if (fs.existsSync(envPath)) {
  console.log(`✅ Loading environment from: ${envFile}`);
  
  // Load environment variables from the file
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  const lines = envConfig.split('\n');
  
  lines.forEach(line => {
    // Skip empty lines and comments
    if (!line || line.trim().startsWith('#')) return;
    
    // Parse KEY=VALUE pairs
    const match = line.match(/^([^=:#]+?)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Only set if not already defined (process.env takes precedence)
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
  
  console.log(`📦 Environment: ${nodeEnv}`);
} else if (fs.existsSync(fallbackPath)) {
  console.log(`⚠️  ${envFile} not found, falling back to .env`);
  
  const envConfig = fs.readFileSync(fallbackPath, 'utf-8');
  const lines = envConfig.split('\n');
  
  lines.forEach(line => {
    if (!line || line.trim().startsWith('#')) return;
    
    const match = line.match(/^([^=:#]+?)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} else {
  console.error(`❌ No environment file found! Looking for: ${envFile} or .env`);
  process.exit(1);
}

module.exports = {
  nodeEnv,
  envFile,
};
