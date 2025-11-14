# 🚨 Quick Fix - Permissions & CORS Issues

## Issue 1: Firestore Rules Not Published ❌

**Error:** `FirebaseError: Missing or insufficient permissions`

**Cause:** The updated `firestore.rules` file hasn't been published to Firebase Console yet.

### ✅ FIX: Publish Rules Now

#### Option A: Firebase Console UI (Easiest)

1. Go to **[Firebase Console](https://console.firebase.google.com/)**
2. Select project **jobfolio-f5b8c**
3. Click **Firestore Database** (left sidebar)
4. Click **Rules** tab
5. In the editor, select all (Ctrl+A) and delete
6. Copy this entire content:

```plaintext
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Profiles: only the profile owner can read and write their profile
    match /profiles/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid || (request.auth != null && request.auth.uid == userId);
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Folios: owner can create/read/update/delete
    match /folios/{folioId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Subscriptions: owner-only access
    match /subscriptions/{subId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Jobs: public read, views can be incremented by anyone
    match /jobs/{jobId} {
      allow read: if true;
      // Allow anyone to increment views (or auth users to update)
      allow update: if (request.resource.data.views == resource.data.views + 1
                        && request.resource.data.likes == resource.data.likes
                        && request.resource.data.applies == resource.data.applies);
      allow create, delete: if request.auth != null && request.auth.token.admin == true;

      // Likes subcollection: users can create/delete their own likes
      match /likes/{userId} {
        allow create: if request.auth != null && request.auth.uid == userId;
        allow read, delete: if request.auth != null && request.auth.uid == userId;
      }

      // Applications subcollection: users can create their own applications
      match /applications/{userId} {
        allow create: if request.auth != null && request.auth.uid == userId && request.resource.data.userId == request.auth.uid;
        allow read: if request.auth != null && request.auth.uid == userId;
        allow update, delete: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Applications: users can create applications for themselves
    match /applications/{appId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Default: deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

7. Click **Publish** (blue button, top-right)
8. Wait for "Rules published successfully" message

#### Option B: Using Firebase CLI (If installed)

```bash
firebase deploy --only firestore:rules
```

---

## Issue 2: Storage CORS Blocking Uploads ❌

**Error:** `Access to XMLHttpRequest... has been blocked by CORS policy`

**Cause:** Firebase Storage CORS not configured for your dev server.

### ✅ FIX: Configure Storage CORS

#### Option A: Firebase Console UI (Recommended for Dev)

1. Go to **[Firebase Console](https://console.firebase.google.com/)**
2. Select project **jobfolio-f5b8c**
3. Click **Storage** (left sidebar)
4. Click **Rules** tab
5. Replace with this:

```plaintext
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Public read access for CVs
    match /cvs/{allPaths=**} {
      allow read: if true;
      // Users can upload their own CV
      allow write: if request.auth != null
                   && request.auth.uid == request.resource.metadata.customMetadata.userId;
    }

    // Default: deny everything else
    match /{allPaths=**} {
      allow read: if false;
      allow write: if false;
    }
  }
}
```

6. Click **Publish**

#### Option B: Configure CORS Headers (For Development)

Create a file `storage-cors.json`:

```json
[
  {
    "origin": [
      "http://localhost:5173",
      "http://172.20.10.6:8080",
      "http://127.0.0.1:5173"
    ],
    "method": ["GET", "HEAD", "DELETE", "POST", "PUT"],
    "responseHeader": ["Content-Type", "x-goog-meta-uploaded-name"],
    "maxAgeSeconds": 3600
  }
]
```

Then run (requires Google Cloud SDK):

```bash
gsutil cors set storage-cors.json gs://jobfolio-f5b8c.firebasestorage.app
```

---

## Quick Status Check

After making these fixes, the errors should disappear:

### ✅ If Firestore Rules Published

- View tracking will work ✅
- Like button will work ✅
- Apply button will work ✅

### ✅ If Storage CORS Configured

- CV upload will work ✅
- File display will work ✅

---

## Test After Fixes

1. **Test View Tracking**

   - Go to `/jobs`
   - Click on a job
   - Check console for "Error recording job view"
   - Should NOT appear anymore

2. **Test Likes & Apply**

   - Go to job details
   - Click like button (should work)
   - Click apply button (should work)

3. **Test CV Upload** (optional)
   - Go to `/build-folio`
   - Upload a PDF
   - Should upload without CORS errors

---

## Summary of Changes Needed

| Issue           | Fix                  | Time  |
| --------------- | -------------------- | ----- |
| Firestore Rules | Publish to Console   | 2 min |
| Storage CORS    | Update Storage Rules | 2 min |

**Total time:** ~5 minutes

---

## Still Getting Errors?

If you still see errors after publishing:

1. **Hard refresh** your browser (Ctrl+Shift+R)
2. **Clear browser cache** (DevTools → Storage → Clear All)
3. **Check Firebase Console** to verify rules were published
4. **Check the rules syntax** for any typos

---

**After you publish, let me know and we can test!** 🚀
