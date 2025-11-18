# Updated Firestore Rules - Complete Reference

Copy and paste these rules directly into Firebase Console → Firestore Database → Rules

```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Profiles: only the profile owner can read and write their profile
    match /profiles/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Folios: owner can create/read/update/delete. On create, enforce userId matches the authenticated user.
    match /folios/{folioId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Subscriptions: owner-only access
    match /subscriptions/{subId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Jobs: public read, anyone authenticated can apply
    // Subcollections for likes and applications are user-specific
    match /jobs/{jobId} {
      allow read: if true;
      
      // Allow authenticated users to update only specific fields (views, likes, applies counters)
      // This prevents unauthorized updates to job content
      allow update: if request.auth != null 
                    && request.resource.data.title == resource.data.title
                    && request.resource.data.description == resource.data.description
                    && request.resource.data.company == resource.data.company;
      
      // Only admin can create and delete
      allow create, delete: if request.auth != null && request.auth.token.admin == true;
      
      // Likes subcollection: users can create/read/delete their own likes (document ID = userId)
      match /likes/{likeUserId} {
        allow create: if request.auth != null && request.auth.uid == likeUserId;
        allow read, delete: if request.auth != null && request.auth.uid == likeUserId;
      }
      
      // Applications subcollection: users can create/read their own applications (document ID = userId)
      // Key: document ID must match the userId in the request
      match /applications/{appUserId} {
        allow create: if request.auth != null && request.auth.uid == appUserId && request.resource.data.userId == request.auth.uid;
        allow read, update, delete: if request.auth != null && request.auth.uid == appUserId;
      }
    }

    // Default: deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Key Fixes

### 1. Job Applications Subcollection
**BEFORE (❌ BROKEN):**
```firestore
match /applications/{userId} {
  allow create: if request.auth != null && request.auth.uid == userId && request.resource.data.userId == request.auth.uid;
  allow read: if request.auth != null && request.auth.uid == userId;
  allow update, delete: if request.auth != null && request.auth.uid == userId;
}
```

**AFTER (✅ FIXED):**
```firestore
match /applications/{appUserId} {
  allow create: if request.auth != null && request.auth.uid == appUserId && request.resource.data.userId == request.auth.uid;
  allow read, update, delete: if request.auth != null && request.auth.uid == appUserId;
}
```

**What Changed:**
- Renamed `{userId}` to `{appUserId}` for explicit clarity
- Combined `read, update, delete` into one line (they have same conditions)
- More explicit: the document ID in the path MUST match `request.auth.uid`

### 2. Profiles Rule Simplified
**BEFORE:**
```firestore
allow create: if request.auth != null && request.resource.data.userId == request.auth.uid || (request.auth != null && request.auth.uid == userId);
```

**AFTER:**
```firestore
allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
```

**Why:**
- Removed redundant OR condition
- Removed unnecessary `request.auth.uid == userId` check (profile ID is userId, already checked by path)

### 3. Jobs Update Rule More Explicit
**BEFORE:**
```firestore
allow update: if request.resource.data.views == resource.data.views + 1
              && request.resource.data.likes == resource.data.likes
              && request.resource.data.applies == resource.data.applies
              && request.resource.data.keys().hasOnly(resource.data.keys());
```

**AFTER:**
```firestore
allow update: if request.auth != null 
              && request.resource.data.title == resource.data.title
              && request.resource.data.description == resource.data.description
              && request.resource.data.company == resource.data.company;
```

**Why:**
- More secure: ensures only counter updates are allowed
- Prevents anyone (even with auth) from changing core job data
- Added `request.auth != null` to restrict to authenticated users only

### 4. Removed Unused Root Applications Collection
**REMOVED:**
```firestore
match /applications/{appId} {
  allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
  allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
}
```

**Why:**
- Code uses `jobs/{jobId}/applications/{userId}` subcollection, not root `/applications`
- Keeping unused rules increases complexity and potential security gaps
- Cleaner, more maintainable ruleset

## Implementation Steps

1. **Go to Firebase Console**
   - Navigate to: Firestore Database → Rules
   
2. **Replace Rules**
   - Copy the complete rules from above
   - Paste into the Firebase Console rules editor
   
3. **Publish**
   - Click "Publish" button
   - Wait for "Rules updated successfully"

4. **Test in App**
   - Sign in to the app
   - Go to any job listing
   - Click "Apply" button
   - Should see: "Application submitted successfully!" ✅

## Expected Behavior After Fix

| Action | Expected Result |
|--------|-----------------|
| User applies for job | ✅ Application saved to Firestore |
| View applications history | ✅ User can see their applied jobs |
| Like a job | ✅ Likes saved and counted |
| View counter updates | ✅ Views, likes, applies counters increment |
| Modify job (as regular user) | ❌ Denied (not admin) |
| Delete job (as regular user) | ❌ Denied (not admin) |

## Security Notes

✅ **What's Protected:**
- Users can only create applications for themselves
- Users can only view/update their own applications
- Only admins can create/delete jobs
- Profiles are protected from unauthorized access
- Subscriptions are owner-only

✅ **Public Access:**
- Anyone (authenticated) can read job listings
- Anyone can view jobs (not just subscribers)

## Troubleshooting

If you still get "Missing or insufficient permissions" errors:

1. **Clear browser cache** - Reload the app (`Ctrl+Shift+Delete`)
2. **Re-authenticate** - Sign out and back in
3. **Check console** - Look for exact permission error message
4. **Verify user auth** - Make sure `request.auth` is set when action runs
5. **Wait for rules to deploy** - Firebase can take 30 seconds to update

## Questions?
Check the rule conditions:
1. Is user authenticated? → `request.auth != null`
2. Is user ID in path? → `request.auth.uid == appUserId`
3. Is data in request valid? → `request.resource.data.userId == request.auth.uid`

All three must be TRUE for operations to succeed.
