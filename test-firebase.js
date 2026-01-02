#!/usr/bin/env node

import admin from "firebase-admin";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🔍 Testing Firebase Admin SDK connection...\n");

// Prefer env-based credentials: FIREBASE_SERVICE_ACCOUNT_JSON, SERVICE_ACCOUNT_BASE64, or SERVICE_ACCOUNT_PATH
const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || null;
const saBase64 = process.env.SERVICE_ACCOUNT_BASE64 || null;
const saPath = process.env.SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS || null;

if (!svcJson && !saBase64 && !saPath) {
  console.error("❌ No service account credentials provided. Set FIREBASE_SERVICE_ACCOUNT_JSON, SERVICE_ACCOUNT_BASE64, or SERVICE_ACCOUNT_PATH.");
  process.exit(1);
}

try {
  let serviceAccount = null;
  if (svcJson) {
    serviceAccount = JSON.parse(svcJson);
  } else if (saBase64) {
    serviceAccount = JSON.parse(Buffer.from(saBase64, 'base64').toString('utf8'));
  } else {
    if (!fs.existsSync(saPath)) {
      throw new Error(`Service account file not found at: ${saPath}`);
    }
    serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf-8'));
  }

  console.log("📋 Service Account Info:");
  console.log(`  Project ID: ${serviceAccount.project_id}`);
  console.log(`  Client Email: ${serviceAccount.client_email}`);
  console.log(`  Private Key ID: ${serviceAccount.private_key_id}`);

  // Initialize Firebase Admin
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  console.log("✅ Firebase Admin SDK initialized successfully!");
  
  // Test Firestore connection
  const db = admin.firestore();
  
  // Try to read from a collection (this will test permissions)
  console.log("🔍 Testing Firestore connection...");
  const testDoc = await db.collection('test').limit(1).get();
  console.log("✅ Firestore connection successful!");
  
  console.log("\n🎉 All tests passed! You can now run the seed script.");
  
} catch (error) {
  console.error("❌ Error:", error.message);
  
  if (error.message.includes('invalid_grant') || error.message.includes('JWT')) {
    console.error("\n🔧 JWT Token Error Solutions:");
    console.error("1. Generate a new service account key:");
    console.error("   https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk");
    console.error("2. Make sure your system time is synchronized");
    console.error("3. Try running immediately after generating the key");
  }
  
  process.exit(1);
}