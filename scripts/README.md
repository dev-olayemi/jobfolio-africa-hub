# JobFolio Scripts - Development Setup Guide

This directory contains helper scripts for local development and testing.

## Quick Start: Seed Database with Test Data

### Prerequisites

1. **Firebase Service Account JSON**

   - Go to [Firebase Console](https://console.firebase.google.com/) → Your Project → Settings (⚙️) → Service Accounts
   - Click "Generate New Private Key"
   - Save the downloaded JSON file (e.g., `serviceAccountKey.json`)
   - **IMPORTANT: Never commit this file to git. Add it to `.gitignore`.**

2. **Node.js & npm**

   - Ensure you have Node.js 14+ and npm installed

3. **Google Cloud SDK (optional, for CORS setup)**
   - Install from https://cloud.google.com/sdk/docs/install if you want to use `gsutil` commands
   - Or use Firebase Console UI (easier for most users)

### Step 1: Fix Firebase Storage CORS (Required for File Uploads)

The app will fail to upload files (CV) to Cloud Storage unless CORS is configured. Follow one of these methods:

#### Method A: Using Firebase Console (Easiest - No Installation Required)

1. Go to [Firebase Console](https://console.firebase.google.com/) → Your Project → Storage
2. Click on the "Rules" tab (or look for "CORS configuration")
3. Create a file `scripts/storage-cors.json` in your repo root with this content:

```json
[
  {
    "origin": [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://172.20.10.6:8080",
      "http://localhost:3000"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "responseHeader": [
      "Content-Type",
      "x-goog-resumable",
      "X-Requested-With",
      "Authorization"
    ],
    "maxAgeSeconds": 3600
  }
]
```

4. If you see a CORS configuration option in Firebase Console, paste the JSON there and save.
5. If not visible, proceed to Method B using the Cloud Console or gsutil.

#### Method B: Using gsutil Command (If Google Cloud SDK Installed)

1. Create the CORS file above at `scripts/storage-cors.json`
2. Find your Storage bucket name:

   - Firebase Console → Storage → Bucket details (usually `projectId.appspot.com`)
   - For the jobfolio project, it's typically `jobfolio-f5b8c.appspot.com`

3. Open PowerShell and run:

```powershell
# Set your service account
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\serviceAccountKey.json'

# Apply CORS (replace bucket name if different)
gsutil cors set .\scripts\storage-cors.json gs://jobfolio-f5b8c.appspot.com

# Verify CORS was applied
gsutil cors get gs://jobfolio-f5b8c.appspot.com
```

4. Wait 1-2 minutes for changes to propagate.

### Step 2: Install Dependencies

```powershell
npm install firebase-admin
```

### Step 3: Run the Seed Script

```powershell
# Set service account environment variable (one-time per PowerShell session)
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\serviceAccountKey.json'

# Run the seed script
node .\scripts\seedFirestore.js
```

**Expected Output:**

```
Auth user exists: alice@example.com (uid=...)
Wrote profile for uid=...
Created folio for uid=...
Created subscription for uid=...
Wrote job job_frontend_1
Wrote job job_product_1
... (more jobs)
Seed completed.
```

### Step 4: Verify Data in Firebase Console

1. **Check Authentication:**

   - Firebase Console → Authentication → Users
   - You should see `alice@example.com` and `ben@example.com`

2. **Check Firestore Collections:**

   - Firebase Console → Firestore → Collections
   - Verify these collections exist with data:
     - `profiles/` - user profiles (keyed by UID)
     - `folios/` - CV info (should have 1 for alice)
     - `subscriptions/` - trial info (should have 1 for alice)
     - `jobs/` - should have 8 job listings

3. **Check Cloud Storage:**
   - Firebase Console → Storage → Files
   - (Should be empty for now; we seed via Firestore, not Storage)

### Step 5: Test the App

1. **Start dev server:**

   ```powershell
   npm run dev
   # or
   bun dev
   ```

2. **Sign in with test account:**

   - Navigate to http://localhost:5173 (or your dev URL)
   - Click "Sign Up" or "Sign In"
   - Use: `alice@example.com` / `Password123!`

3. **Verify features:**
   - Visit `/profile` → Should see Alice's profile
   - Visit `/jobs` → Should see 8 sample jobs
   - Try uploading a CV in `/build-folio` → Should work (if CORS is set)

## Troubleshooting

### "Missing or insufficient permissions" Error

**Solution:** Update your Firestore security rules. Use these for development:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /folios/{folioId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    match /subscriptions/{subId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    match /jobs/{jobId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && request.auth.token.admin == true;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Go to Firebase Console → Firestore → Rules → Paste → Publish.

### "CORS policy: Response to preflight request doesn't pass access control check"

**Solution:**

1. Confirm CORS was applied to the correct bucket:

   ```powershell
   gsutil cors get gs://jobfolio-f5b8c.appspot.com
   ```

   (Should output the CORS JSON you set)

2. Confirm your dev origin matches one in the CORS config:

   - Check browser DevTools Console → should show origin like `http://172.20.10.6:8080`
   - Ensure that origin (or a wildcard) is in the CORS origins list

3. Clear browser cache and retry:
   - DevTools → Application → Clear Storage
   - Or use Incognito mode

### "No data showing in Firestore"

**Solution:**

1. Confirm script ran successfully (check for "Seed completed" output)
2. Go to Firebase Console → Firestore → Collections
3. Check if collections exist:

   - If `profiles`, `jobs` etc. don't appear, the script may have failed due to permissions
   - Check the script output for errors

4. Run the seed script again:

   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\serviceAccountKey.json'
   node .\scripts\seedFirestore.js
   ```

5. If still failing, check your service account has permissions:
   - Firebase Console → Settings → Service Accounts → look for your account
   - Ensure it has "Editor" or "Firebase Admin" role in Google Cloud IAM

### "Module not found: firebase-admin"

**Solution:**

```powershell
npm install firebase-admin --save-dev
```

## Files in This Directory

- **seedFirestore.js** - Seeds test users (Auth), profiles, folios, subscriptions, and 8 sample jobs
- **storage-cors.json** - CORS configuration for Cloud Storage (create this file if needed)
- **README.md** - This file

## For Production

⚠️ **IMPORTANT:**

- Never use the seed script against a production database
- Never commit `serviceAccountKey.json` to version control
- Always use proper Firestore security rules (not `allow true` for all reads)
- Use environment variables to manage sensitive credentials
- Implement proper authentication and authorization flows

## Additional Resources

- [Firebase Admin SDK Docs](https://firebase.google.com/docs/database/admin/start)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Storage CORS Guide](https://cloud.google.com/storage/docs/configuring-cors)
- [gsutil Documentation](https://cloud.google.com/storage/docs/gsutil)
