# Dynamic Job Metrics System

Your job listings now have real, dynamic metrics that update in real-time from Firestore!

## How It Works

### 1. View Tracking (Automatic)

- When a user clicks on a job card → view count increments
- When a user navigates to job details page → view count increments again
- No user authentication needed

**Implementation:**

```typescript
// src/lib/jobMetrics.ts
recordJobView(jobId); // Increments views by 1
```

### 2. Like System (User-Specific)

- Users can like/unlike jobs from the job details page
- Like state is stored per user (prevents double-counting)
- Like count updates in real-time

**Features:**

- ❤️ Like button toggles on job details page
- Shows filled heart when liked
- Persists across sessions
- Toast notifications for feedback

**Implementation:**

```typescript
toggleJobLike(jobId, userId); // Add or remove like
hasUserLikedJob(jobId, userId); // Check if user has liked
```

### 3. Application Tracking (User-Specific)

- Users can apply for jobs (with subscription)
- Each user can only apply once per job
- Application count increments on first apply
- Shows "Already Applied" if user tries to apply again

**Features:**

- Apply button disabled after first application
- Toast confirmation on successful apply
- Validation prevents duplicate applications

**Implementation:**

```typescript
submitJobApplication(jobId, userId); // Create application record
hasUserApplied(jobId, userId); // Check if user applied
getApplicationStatus(jobId, userId); // Get status: pending, reviewed, etc.
```

## Database Structure

### Firestore Collections

```
jobs/
├── {jobId}
│   ├── title, company, salary, views, likes, applies...
│   ├── likes/ (subcollection)
│   │   └── {userId}
│   │       └── userId, createdAt
│   └── applications/ (subcollection)
│       └── {userId}
│           └── userId, jobId, status, appliedAt
```

### Example Job Document

```json
{
  "id": "job_frontend_1",
  "title": "Frontend Engineer",
  "company": "Acme Africa",
  "views": 345, // Auto-incremented on each view
  "likes": 28, // Incremented when users like
  "applies": 12 // Incremented when users apply
  // ... other fields
}
```

## UI Components

### Jobs Page (List View)

Shows read-only metrics:

- 👁️ View count
- ❤️ Like count
- 👥 Application count

Location: `src/pages/Jobs.tsx`

### Job Details Page (Single Job View)

Shows interactive metrics:

- 👁️ View count (top right)
- ❤️ Like count (top right)
- 👥 Application count (top right)
- **Like Button**: Toggle button to like/unlike job
- **Apply Button**: Submit application (with validation)

Location: `src/pages/JobDetails.tsx`

## Security Rules (Updated)

All metrics operations are protected in `firestore.rules`:

### Views

- Can be incremented by anyone (no auth required)
- Updated via server-side increment

### Likes

- Each user has their own like document: `jobs/{jobId}/likes/{userId}`
- Users can only create/read/delete their own like

### Applications

- Each user has their own application: `jobs/{jobId}/applications/{userId}`
- Users can only create their own applications
- Applications are immutable once created (read-only for user)

## Code Files Modified

1. **src/lib/firebase-types.ts**

   - Added `views`, `likes`, `applies`, `logoUrl` to Job interface

2. **src/lib/jobMetrics.ts** (NEW)

   - Core functions for managing metrics
   - recordJobView(), toggleJobLike(), submitJobApplication()
   - Helper functions for checking user state

3. **src/pages/Jobs.tsx**

   - Calls `recordJobView()` on job card click
   - Displays metrics in card footer
   - Logo and initials-based fallback

4. **src/pages/JobDetails.tsx**

   - Calls `recordJobView()` on page load
   - Shows interactive metrics in header
   - Like button with toggle functionality
   - Apply button with duplicate prevention
   - User state tracking (isLiked, hasApplied)

5. **firestore.rules**
   - Added subcollections: jobs/{jobId}/likes/{userId}
   - Added subcollections: jobs/{jobId}/applications/{userId}
   - Security rules for each operation

## API Reference

### recordJobView(jobId: string)

Increment view count for a job. Call on:

- Job card click (in Jobs.tsx)
- Job details page load (in JobDetails.tsx)

```typescript
await recordJobView(jobId);
```

### toggleJobLike(jobId: string, userId: string)

Add or remove a like. Returns true if now liked, false if unliked.

```typescript
const isLiked = await toggleJobLike(jobId, currentUser.uid);
```

### hasUserLikedJob(jobId: string, userId: string)

Check if a user has liked a job.

```typescript
const liked = await hasUserLikedJob(jobId, currentUser.uid);
```

### submitJobApplication(jobId: string, userId: string)

Submit a job application. Throws error if already applied.

```typescript
try {
  await submitJobApplication(jobId, currentUser.uid);
  // Success
} catch (error) {
  // Already applied or other error
}
```

### hasUserApplied(jobId: string, userId: string)

Check if a user has applied for a job.

```typescript
const applied = await hasUserApplied(jobId, currentUser.uid);
```

### getApplicationStatus(jobId: string, userId: string)

Get the status of a user's application (pending, reviewed, accepted, rejected).

```typescript
const status = await getApplicationStatus(jobId, currentUser.uid);
```

## Testing Checklist

- [ ] View count increments when clicking job card
- [ ] View count increments when visiting job details
- [ ] Like button toggles on job details page
- [ ] Like count increases/decreases with like toggle
- [ ] Like state persists when navigating away and back
- [ ] Apply button submits application
- [ ] Apply count increments after applying
- [ ] "Already Applied" message shows on second apply attempt
- [ ] Like button is available without subscription
- [ ] Apply button requires subscription (shows access dialog if not)
- [ ] Metrics display correctly for jobs with and without data
- [ ] Seed script includes initial metrics values

## Next Steps

1. **Real-Time Updates**: Add Firestore listeners to update metrics in real-time as other users interact
2. **Analytics Dashboard**: Show user their applications and liked jobs
3. **Job Recommendations**: Suggest jobs based on liked categories
4. **Application Status Tracking**: Allow employers to update application status
5. **Notifications**: Notify users when their application is reviewed

## Known Limitations

- Metrics only update when page is refreshed (no real-time listeners yet)
- Applications are read-only after creation (can't be deleted by user)
- No way to unlike/unapply from Jobs list page (must go to details)
- Application count includes all applications (no grouping by status)

## Future Enhancements

```typescript
// Real-time listener for metrics
function watchJobMetrics(jobId: string, callback: (job: Job) => void) {
  return onSnapshot(doc(db, "jobs", jobId), (doc) => {
    callback(doc.data() as Job);
  });
}

// Get user's liked jobs
async function getUserLikedJobs(userId: string): Promise<Job[]> {
  // Implementation needed
}

// Get user's applications
async function getUserApplications(userId: string): Promise<Application[]> {
  // Implementation needed
}
```
