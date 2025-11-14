# Dynamic Metrics Testing Guide

Follow these steps to test the dynamic metrics system in your Jobfolio app.

## Prerequisites

1. ✅ Seed script has been run (12 jobs created)
2. ✅ Firebase rules updated to allow metrics operations
3. ✅ Code deployed (or running in dev server)
4. ✅ Browser dev console is open (for error checking)

## Test User Accounts

Use these credentials to test (created by seed script):

| Email             | Password     | Trial  | Notes                |
| ----------------- | ------------ | ------ | -------------------- |
| alice@example.com | Password123! | ✅ Yes | Can apply + like     |
| ben@example.com   | Password123! | ❌ No  | Can only view + like |

## Testing Steps

### Test 1: View Tracking

**Objective:** Verify view count increments when accessing jobs

**Steps:**

1. Sign in with alice@example.com
2. Go to Jobs page (`/jobs`)
3. Note the view count for first job (e.g., "342 views")
4. Click on the first job card
5. Check Firebase Console: Views in Firestore `jobs/{jobId}` should increment

**Expected Result:**

- View count increases by 1 in Firestore
- Same view count shows on job card and details page
- Multiple views increment correctly

**Firebase Console Check:**

1. Go to Firebase Console → Firestore
2. Collection: `jobs`
3. Document: `job_frontend_1`
4. Field: `views` (should be updated)

---

### Test 2: Like Button (Authenticated User)

**Objective:** Verify like toggle works and persists

**Steps:**

1. Stay on Job Details page (from Test 1)
2. Click the ❤️ Like button
3. Button should fill with color/turn red
4. Like count should increase by 1
5. Click again to unlike
6. Button should unfill
7. Like count should decrease by 1

**Expected Result:**

- Like button toggles between liked/unliked state
- Like count increments/decrements correctly
- Toast notification shows: "Added to likes" / "Removed from likes"

**Firestore Check:**

1. Go to `jobs/{jobId}/likes` subcollection
2. Should see a document with the user's UID as the ID
3. Contains: `userId`, `createdAt`
4. Deleting like should remove this document

---

### Test 3: Like State Persistence

**Objective:** Verify liked state persists across navigation

**Steps:**

1. From Test 2, you should have liked a job
2. Navigate back to Jobs page
3. Click the same job again to return to details
4. The ❤️ Like button should still appear filled/red

**Expected Result:**

- Like state is remembered when returning to the job
- No need to refresh page for state to persist

---

### Test 4: Application Tracking (With Subscription)

**Objective:** Verify application submission works with access

**Steps:**

1. Stay on Job Details page (alice@example.com has trial subscription)
2. Scroll down to bottom
3. Click "Apply Now" button
4. Button should show "✓ Already Applied" and be disabled
5. Apply count should increase by 1
6. Toast: "Application submitted successfully!"

**Expected Result:**

- Application created in Firestore
- Apply count increments
- Button shows "Already Applied" state
- Clicking apply again shows toast: "You have already applied for this job"

**Firestore Check:**

1. Go to `jobs/{jobId}/applications` subcollection
2. Should see document with user's UID as ID
3. Contains: `userId`, `jobId`, `status: "pending"`, `appliedAt`

---

### Test 5: Application Without Access

**Objective:** Verify access control for applications

**Steps:**

1. Sign out (or open new incognito window)
2. Sign in with ben@example.com (no subscription)
3. Go to a different job (e.g., `job_product_1`)
4. Try to click "Apply Now" button
5. Dialog should appear: "Access Required"

**Expected Result:**

- Users without subscription cannot apply
- Access dialog shows options to build folio or grant access
- Trying to apply redirects to auth page if not logged in

---

### Test 6: Multiple Users Metrics

**Objective:** Verify metrics are shared across users

**Steps:**

1. In one browser: Sign in as alice@example.com, go to a job, like it
2. In another browser/incognito: Sign in as ben@example.com
3. Go to the same job details page
4. Like count should show the incremented value from alice's like
5. Ben should be able to like it independently

**Expected Result:**

- Like counts are aggregated across all users
- Each user has their own like state (can like independently)
- Likes are not "per-user" but "per-job"

---

### Test 7: Metrics Display on List Page

**Objective:** Verify metrics show correctly on Jobs list

**Steps:**

1. Go to Jobs page (`/jobs`)
2. Look at any job card
3. Bottom-right should show: "X views", "Y likes", "Z applied"
4. Numbers should match what you see on details page

**Expected Result:**

- All three metrics display correctly
- Numbers are consistent across views
- Icons (👁️, ❤️, 👥) are visible

---

### Test 8: View Count Edge Case

**Objective:** Test that views increment even for unauthenticated users

**Steps:**

1. Open browser dev console
2. Go to `/jobs` (any page)
3. Click a job you haven't visited
4. Check Firestore view count for that job
5. Repeat multiple times

**Expected Result:**

- Views increment even without logging in
- Views are NOT tied to specific users
- Every click = +1 view

---

## Console Errors to Watch For

If you see these errors, check the notes:

### "Error recording job view"

- **Cause:** Firestore permission denied
- **Fix:** Check firestore.rules for correct syntax
- **Solution:** Publish updated rules to Firebase Console

### "Error toggling like"

- **Cause:** Subcollection doesn't exist or permission denied
- **Fix:** Verify `jobs/{jobId}/likes/{userId}` is allowed in rules
- **Solution:** Re-publish firestore.rules

### "You have already applied for this job"

- **Cause:** User tried to apply twice
- **Expected:** This is correct behavior
- **Action:** Verify "Already Applied" message shows and button is disabled

### "Failed to submit application"

- **Cause:** Duplicate application or permission denied
- **Fix:** Check that user's subscription status is valid
- **Solution:** Go to `/profile` and check subscription status

---

## Manual Firestore Verification

To verify data is being stored correctly:

### 1. Check Views

```
Collection: jobs
Document: job_frontend_1
Field: views
Expected: Should be higher than initial seed value
```

### 2. Check Likes

```
Collection: jobs
Document: job_frontend_1
Subcollection: likes
Expected: Document(s) with user UIDs as IDs
```

### 3. Check Applications

```
Collection: jobs
Document: job_frontend_1
Subcollection: applications
Expected: Document with alice's UID (from Test 4)
Fields: userId, jobId, status: "pending", appliedAt
```

---

## Performance Testing

### Response Time

- Like toggle should respond in <1 second
- View count increment should be fast (client-side)
- Apply button should process in <2 seconds

### Data Consistency

- Like counts should match number of documents in `likes/` subcollection
- Apply counts should match number of documents in `applications/` subcollection

---

## Rollback / Reset Data

If you need to reset metrics for testing:

**Via Firebase Console:**

1. Go to Firestore
2. Delete the `likes/` subcollection from any job
3. Delete the `applications/` subcollection from any job
4. Edit the `views`, `likes`, `applies` fields back to seed values

**Or Re-run Seed Script:**

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\serviceAccountKey.json'
node .\scripts\seedFirestore.js
```

This will update all documents with fresh seed data (idempotent).

---

## Troubleshooting Checklist

- [ ] Can you see metrics on Jobs list page?
- [ ] Do metrics increment when you click on jobs?
- [ ] Can you toggle the like button?
- [ ] Does the like button stay filled when you return to the job?
- [ ] Can you apply for jobs (with alice account)?
- [ ] Does "Already Applied" show on second attempt?
- [ ] Does Ben (no subscription) see access dialog?
- [ ] Are metrics visible in Firestore Console?
- [ ] Do error messages appear in browser console?
- [ ] Do toast notifications appear for all actions?

---

## Success Criteria

✅ All tests pass when:

1. View counts increment on job interactions
2. Like button toggles and persists state
3. Application submission works with access control
4. All metrics are visible and accurate
5. Firestore data structure matches expected format
6. No console errors occur during normal usage
7. Toast notifications provide user feedback
8. Access controls prevent unauthorized actions

You're done! 🎉
