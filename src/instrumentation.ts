/**
 * Next.js Instrumentation Hook
 * ============================
 * This file runs BEFORE any other code in the application.
 * It's the perfect place to load environment variables.
 * 
 * Supported in Next.js 13+ (you're using 15.1.7 ✅)
 * Documentation: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Load environment configuration BEFORE anything else
    require('../env.config.js');
    
    console.log('🔧 Environment configuration loaded via instrumentation hook');
  }
}
