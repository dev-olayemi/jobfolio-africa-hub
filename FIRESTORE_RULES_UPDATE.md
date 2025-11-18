# Firestore Rules Update - Job Application Fix

## Issue

When users tried to apply for jobs, they received: `FirebaseError: Missing or insufficient permissions`

## Root Cause

The applications subcollection rule was incorrectly configured. The rule used `{userId}` as a variable name in the path pattern, but the variable reference in the condition (`request.auth.uid == userId`) wasn't matching the actual document ID being written.

## What Was Wrong

```firestore
match /applications/{userId} {
  allow create: if request.auth != null && request.auth.uid == userId && request.resource.data.userId == request.auth.uid;
  allow read: if request.auth != null && request.auth.uid == userId;
  allow update, delete: if request.auth != null && request.auth.uid == userId;
}
```

The problem:

- The path variable `{userId}` should match the document ID
- When writing `jobs/{jobId}/applications/{userId}`, the document ID is the user's UID
- But the rule wasn't properly enforcing that the path variable matched the authenticated user

## Solution

Changed the rule to be more explicit and clear:

```firestore
match /applications/{appUserId} {
  allow create: if request.auth != null && request.auth.uid == appUserId && request.resource.data.userId == request.auth.uid;
  allow read, update, delete: if request.auth != null && request.auth.uid == appUserId;
}
```

### Key Changes:

1. **Renamed path variable** from `{userId}` to `{appUserId}` for clarity
2. **Simplified conditions** - removed redundant checks
3. **Removed unused root `applications` collection** rule (wasn't being used by the code)
4. **Improved Profiles rule** - removed OR condition that was overly permissive
5. **Improved Jobs update rule** - more explicit field checking to prevent unauthorized modifications

## How Job Applications Work Now

1. User clicks "Apply" on a job → `JobDetails.tsx` → calls `submitJobApplication(jobId, userId)`
2. Function writes to: `jobs/{jobId}/applications/{userId}`
3. Firestore rules check:
   - ✅ User is authenticated (`request.auth != null`)
   - ✅ Document ID matches user's UID (`request.auth.uid == appUserId`)
   - ✅ The data being written includes `userId: request.auth.uid` (verification)
4. If all pass → Application is saved + applies counter increments

## Testing the Fix

1. Sign in to the app
2. Navigate to any job listing
3. Click "Apply" button
4. You should now see: "Application submitted successfully!" ✅

## File Changes

- `firestore.rules` - Updated with corrected rules

## Rules Summary

| Collection                         | Operation          | Who Can   | Condition                                    |
| ---------------------------------- | ------------------ | --------- | -------------------------------------------- |
| profiles/{userId}                  | Read               | Owner     | uid == userId                                |
| profiles/{userId}                  | Create             | Auth User | data.userId == auth.uid                      |
| profiles/{userId}                  | Update/Delete      | Owner     | resource.data.userId == auth.uid             |
| folios/{folioId}                   | Create             | Auth User | data.userId == auth.uid                      |
| folios/{folioId}                   | Read/Update/Delete | Owner     | data.userId == auth.uid                      |
| subscriptions/{subId}              | Create             | Auth User | data.userId == auth.uid                      |
| subscriptions/{subId}              | Read/Update/Delete | Owner     | data.userId == auth.uid                      |
| jobs/{jobId}                       | Read               | Everyone  | true                                         |
| jobs/{jobId}                       | Update             | Auth User | Only counter fields change                   |
| jobs/{jobId}                       | Create/Delete      | Admin     | admin == true                                |
| jobs/{jobId}/likes/{userId}        | Create             | Owner     | auth.uid == userId                           |
| jobs/{jobId}/likes/{userId}        | Read/Delete        | Owner     | auth.uid == userId                           |
| jobs/{jobId}/applications/{userId} | Create             | Owner     | auth.uid == userId + data.userId == auth.uid |
| jobs/{jobId}/applications/{userId} | Read/Update/Delete | Owner     | auth.uid == userId                           |

## Next Steps

- Deploy these rules to Firebase Console
- Test the job application flow
- Monitor for any permission errors in the console
