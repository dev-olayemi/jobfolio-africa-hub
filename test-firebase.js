#!/usr/bin/env node

import admin from "firebase-admin";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🔍 Testing Firebase Admin SDK connection...\n");

// Try to find service account key
const possiblePaths = [
  join(__dirname, "scripts", "serviceAccountKey.json"),
  join(__dirname, "jobfolio-f5b8c-firebase-adminsdk-fbsvc-34f25815d4.json"),
  join(__dirname, "jobfolio-f5b8c-firebase-adminsdk-fbsvc-bb6425bed8.json"),
];

let saPath = null;
for (const path of possiblePaths) {
  if (fs.existsSync(path)) {
    saPath = path;
    console.log("✅ Found service account:", path);
    break;
  }
}

if (!saPath) {
  console.error("❌ No service account key found in:");
  possiblePaths.forEach(path => console.error(`  - ${path}`));
  process.exit(1);
}

try {
  const serviceAccountText = fs.readFileSync(saPath, "utf-8");
  const serviceAccount = JSON.parse(serviceAccountText);
  
  console.log("📋 Service Account Info:");
  console.log(`  Project ID: ${serviceAccount.project_id}`);
  console.log(`  Client Email: ${serviceAccount.client_email}`);
  console.log(`  Private Key ID: ${serviceAccount.private_key_id}`);
  
  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
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