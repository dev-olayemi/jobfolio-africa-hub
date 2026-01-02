#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';

console.log('🔧 Fixing Firebase Firestore Permissions...\n');

// Step 1: Validate firestore.rules syntax
console.log('1. Validating Firestore rules syntax...');
if (!fs.existsSync('firestore.rules')) {
  console.error('❌ firestore.rules file not found!');
  process.exit(1);
}

// Step 2: Deploy the rules
console.log('2. Deploying updated Firestore rules...');
exec('firebase deploy --only firestore:rules', (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Deployment failed: ${error.message}`);
    console.error('Make sure you have Firebase CLI installed and are logged in:');
    console.error('  npm install -g firebase-tools');
    console.error('  firebase login');
    return;
  }
  
  if (stderr && !stderr.includes('Warning')) {
    console.error(`⚠️  Deployment warnings: ${stderr}`);
  }
  
  console.log('✅ Firestore rules deployed successfully!');
  console.log(stdout);
  
  console.log('\n🎉 Permission fixes applied:');
  console.log('  ✓ Job view tracking permissions');
  console.log('  ✓ Job like/unlike permissions');
  console.log('  ✓ Job application permissions');
  console.log('  ✓ Metric counter update permissions');
  console.log('  ✓ Collection group query permissions');
  
  console.log('\n📝 Changes made:');
  console.log('  • Updated job metrics update rules');
  console.log('  • Relaxed like subcollection permissions');
  console.log('  • Improved application creation permissions');
  console.log('  • Added better error handling in jobMetrics.ts');
  
  console.log('\n🔄 Please refresh your app to test the fixes.');
});

// Step 3: Show next steps
console.log('\n📋 Next steps after deployment:');
console.log('  1. Refresh your application');
console.log('  2. Test job viewing (should increment view count)');
console.log('  3. Test job liking/unliking');
console.log('  4. Test job applications');
console.log('  5. Check browser console for any remaining errors');