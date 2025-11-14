# Quick Reference - Dynamic Job Metrics

## TL;DR

Your job metrics are now **100% dynamic and real**. Every interaction updates Firestore:

- 👁️ **Views** - Auto-increment when anyone clicks or visits a job
- ❤️ **Likes** - User can toggle, persists across sessions
- 👥 **Applications** - User submits, count increments, duplicates prevented

---

## Key Files Modified

| File                        | What Changed                       | Impact              |
| --------------------------- | ---------------------------------- | ------------------- |
| `src/lib/jobMetrics.ts`     | NEW file with all metric functions | Core of the system  |
| `src/pages/Jobs.tsx`        | Added view tracking on click       | Views now tracked   |
| `src/pages/JobDetails.tsx`  | Added like/apply buttons           | Interactive metrics |
| `firestore.rules`           | Added subcollection rules          | Secure operations   |
| `src/lib/firebase-types.ts` | Added metric fields to Job         | Type safety         |

---

## How to Use

### For End Users

1. **View tracking:** Just click on jobs - views auto-increment
2. **Like jobs:** Click ❤️ button on details page, state persists
3. **Apply:** Click Apply button (requires subscription)

### For Developers

**Track a view:**

```typescript
import { recordJobView } from "@/lib/jobMetrics";

await recordJobView(jobId);
```

**Toggle a like:**

```typescript
import { toggleJobLike } from "@/lib/jobMetrics";

const isLiked = await toggleJobLike(jobId, userId);
```

**Submit application:**

```typescript
import { submitJobApplication } from "@/lib/jobMetrics";

await submitJobApplication(jobId, userId);
```

**Check user's like status:**

```typescript
import { hasUserLikedJob } from "@/lib/jobMetrics";

const liked = await hasUserLikedJob(jobId, userId);
```

**Check user's apply status:**

```typescript
import { hasUserApplied } from "@/lib/jobMetrics";

const applied = await hasUserApplied(jobId, userId);
```

---

## Firestore Structure

```
jobs/job_frontend_1/
├── title: "Frontend Engineer"
├── views: 345          ← Auto-increments
├── likes: 28           ← Increments when users like
├── applies: 12         ← Increments when users apply
├── likes/              ← Subcollection
│   ├── user_1 { userId, createdAt }
│   ├── user_2 { userId, createdAt }
│   └── user_3 { userId, createdAt }
└── applications/       ← Subcollection
    ├── user_1 { userId, jobId, status, appliedAt }
    ├── user_2 { userId, jobId, status, appliedAt }
    └── user_3 { userId, jobId, status, appliedAt }
```

---

## Testing Quickly

### Test Account

```
Email: alice@example.com
Password: Password123!
Has: Trial subscription (can apply)
```

### Test Steps

1. Sign in with alice@example.com
2. Go to `/jobs` → Click a job → View count increases ✅
3. Go to job details → Click ❤️ → Like count increases ✅
4. Click Apply → See "✓ Already Applied" ✅
5. Refresh page → Like button still filled ✅

---

## Security

| Action          | Who?         | Secured?                 |
| --------------- | ------------ | ------------------------ |
| View tracking   | Anyone       | ✅ Auto-increment only   |
| Create like     | Auth'd user  | ✅ Only self             |
| Read like       | Auth'd user  | ✅ Only self             |
| Apply for job   | Subscription | ✅ Requires subscription |
| See job details | Anyone       | ✅ Public read           |

---

## Metrics API

### recordJobView(jobId)

- **What:** Increments job.views by 1
- **Who:** Anyone
- **When:** Job card click, Details page load
- **Returns:** Promise<void>

### toggleJobLike(jobId, userId)

- **What:** Add/remove like for user
- **Who:** Authenticated user
- **When:** Like button click
- **Returns:** Promise<boolean> (true if now liked)

### submitJobApplication(jobId, userId)

- **What:** Create application + increment applies
- **Who:** Authenticated user with subscription
- **When:** Apply button click
- **Returns:** Promise<void> (throws if already applied)

### hasUserLikedJob(jobId, userId)

- **What:** Check if user has liked job
- **Who:** Authenticated user
- **When:** Job details page load
- **Returns:** Promise<boolean>

### hasUserApplied(jobId, userId)

- **What:** Check if user has applied
- **Who:** Authenticated user
- **When:** Job details page load
- **Returns:** Promise<boolean>

---

## Common Issues & Fixes

| Issue                    | Cause                         | Fix                                        |
| ------------------------ | ----------------------------- | ------------------------------------------ |
| "Error recording view"   | Firestore rules not published | Publish `firestore.rules` to Firebase      |
| Like button doesn't work | Rules missing subcollection   | Re-publish updated rules                   |
| Can't apply              | No subscription               | Sign in with alice@example.com (has trial) |
| Metrics don't persist    | Not fetching on page load     | Check JobDetails.tsx useEffect             |
| Duplicate applies        | Validation failed             | Refresh, should show "Already Applied"     |

---

## Next Steps

### Immediate

- [x] Code complete
- [x] Documentation complete
- [x] Ready to test
- [ ] Publish Firestore rules (do this in Firebase Console)

### Testing

- [ ] Follow METRICS_TESTING_GUIDE.md
- [ ] Verify view counts increment
- [ ] Test like toggle
- [ ] Test application submission

### Deployment

- [ ] Deploy to Firebase/Vercel
- [ ] Monitor for errors
- [ ] Gather user feedback

### Future Enhancements

- [ ] Real-time listeners
- [ ] User dashboard
- [ ] Application management
- [ ] Admin panel

---

## Documentation Files

| File                          | Purpose                      | Audience        |
| ----------------------------- | ---------------------------- | --------------- |
| `JOB_METRICS_GUIDE.md`        | Complete technical reference | Developers      |
| `METRICS_TESTING_GUIDE.md`    | Step-by-step testing         | QA/Testers      |
| `DYNAMIC_METRICS_SUMMARY.md`  | Overview of changes          | Everyone        |
| `IMPLEMENTATION_CHECKLIST.md` | Project status               | Project Manager |
| This file                     | Quick reference              | Developers      |

---

## Questions?

Check the docs:

1. **How does it work?** → JOB_METRICS_GUIDE.md
2. **How do I test it?** → METRICS_TESTING_GUIDE.md
3. **What was changed?** → DYNAMIC_METRICS_SUMMARY.md
4. **Is it done?** → IMPLEMENTATION_CHECKLIST.md

---

## Status

```
┌─────────────────────────────────┐
│  Dynamic Metrics System         │
│                                 │
│  ✅ Implementation Complete    │
│  ✅ Tests Ready                │
│  ✅ Documentation Complete     │
│  ⏳ Deploy Pending             │
│                                 │
│  Ready for Launch! 🚀          │
└─────────────────────────────────┘
```

---

**Created:** November 13, 2025
**Status:** ✅ Complete & Ready to Deploy
