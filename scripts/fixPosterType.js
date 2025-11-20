#!/usr/bin/env node
/**
 * Fix existing job documents that have an `undefined` posterType field.
 * Usage:
 * 1. Install deps: npm install firebase-admin
 * 2. Set env var pointing to service account JSON: $env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\key.json'
 * 3. Run: node scripts/fixPosterType.js
 */

import admin from "firebase-admin";
import fs from "fs";

// Support two modes of providing service account credentials:
// 1) Set GOOGLE_APPLICATION_CREDENTIALS to the path of a JSON file (existing behavior)
// 2) Set FIREBASE_SERVICE_ACCOUNT_JSON to the full JSON string (useful for CI or env-only setups)
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!serviceAccountPath && !serviceAccountJson) {
  console.error(
    "Please set either GOOGLE_APPLICATION_CREDENTIALS (file path) or FIREBASE_SERVICE_ACCOUNT_JSON (JSON string)"
  );
  process.exit(1);
}

if (serviceAccountJson) {
  // Initialize with JSON from env
  try {
    const parsed = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(parsed),
    });
  } catch (err) {
    console.error(
      "Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:",
      err.message || err
    );
    process.exit(1);
  }
} else {
  // Initialize with application default (path provided via GOOGLE_APPLICATION_CREDENTIALS)
  if (!fs.existsSync(serviceAccountPath)) {
    console.error(
      `The file at ${serviceAccountPath} does not exist, or it is not a file.`
    );
    process.exit(1);
  }
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

async function fix() {
  const snapshot = await db.collection("jobs").get();
  console.log(`Found ${snapshot.size} job documents`);
  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.posterType === undefined) {
      console.log(`Updating ${doc.id} — setting posterType to 'unknown'`);
      await doc.ref.update({ posterType: "unknown" });
      updated++;
    }
  }
  console.log(`Updated ${updated} documents`);
  process.exit(0);
}

fix().catch((err) => {
  console.error(err);
  process.exit(1);
});
