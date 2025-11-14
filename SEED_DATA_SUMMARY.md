# Seed Data Summary

This document describes the test data that has been seeded into your Firestore database.

## Test Users

The seed script creates 5 test users (or uses existing ones):

| Email              | Password     | Name           | Notes                             |
| ------------------ | ------------ | -------------- | --------------------------------- |
| alice@example.com  | Password123! | Alice Adewale  | ✅ Has folio + trial subscription |
| ben@example.com    | Password123! | Ben Okoro      | Profile only                      |
| chioma@example.com | Password123! | Chioma Okonkwo | Profile only                      |
| kwame@example.com  | Password123! | Kwame Mensah   | Profile only                      |
| amara@example.com  | Password123! | Amara Hassan   | Profile only                      |

### To Test Login

1. Sign in at `/auth` with any of the above email/password combinations
2. Alice has a trial subscription and can view jobs
3. Others will need to build a folio or grant access

## Test Jobs (12 Total)

All jobs include:

- Company logo (currently using favicon.png as placeholder)
- View counts (189-521)
- Like counts (11-45)
- Application counts (6-25)

### Job Categories

#### Engineering (5 jobs)

1. **Frontend Engineer** @ Acme Africa - Lagos, Nigeria - $1,200-$2,000
2. **Backend Engineer** @ DigitalRoots - Accra, Ghana - $1,300-$2,200
3. **DevOps Engineer** @ CloudNine - Nairobi, Kenya - $1,400-$2,300
4. **Data Engineer** @ DataFlow Analytics - Johannesburg, South Africa - $1,300-$2,100
5. **Full Stack Developer** @ TechVenture - Cairo, Egypt - $1,100-$1,900

#### Product (2 jobs)

1. **Product Manager** @ Beta Labs - Nairobi, Kenya - $1,500-$2,500
2. **Business Analyst** @ Insight Consulting - Lagos, Nigeria - $800-$1,400

#### Design (1 job)

1. **Product Designer** @ StudioX - Kigali, Rwanda - $900-$1,400

#### Sales (1 job)

1. **Sales Executive** @ MarketReach - Kampala, Uganda - $600-$1,000

#### Marketing (1 job)

1. **Marketing Specialist** @ SparkMedia - Accra, Ghana - $700-$1,200

#### Operations (1 job)

1. **Operations Manager** @ AgriSupply - Dar es Salaam, Tanzania - $800-$1,300

#### Support (1 job)

1. **Customer Support** @ HelpDesk Africa - Lagos, Nigeria - $400-$700

## Job Listings UI Enhancements

The Jobs page now displays:

### Visual Improvements

- **Company Logo**: Displays favicon.png (you can replace with actual company logos)
- **Gradient Fallback**: Shows company initials in a gradient circle if logo fails
- **Better Layout**: Horizontal card layout with logo on the left
- **Hover Effects**: Smooth shadow and border transitions

### Metrics Display

Each job card shows:

- **👁️ Views**: 189-521 (shows popularity)
- **❤️ Likes**: 11-45 (engagement metric)
- **👥 Applied**: 6-25 (application count)

### Card Content

- Job title with company name
- Country location
- Salary range prominently displayed
- Time posted (e.g., "3 days ago")
- Category badge
- Apply/Details button

## Database Schema Updates

The `Job` interface now includes:

```typescript
views?: number;      // Page views
likes?: number;      // User likes/saves
applies?: number;    // Number of applications
logoUrl?: string;    // Company logo URL
```

## How to Replace Company Logos

To add real company logos:

1. **Option A: Upload images to Firebase Storage**

   - Upload logo images to your Storage bucket
   - Get public URLs
   - Update job documents in Firestore with the URLs

2. **Option B: Use external URLs**

   - Use CDN or company-hosted logo URLs
   - Update the seed script with logoUrl values

3. **Option C: Use CSS-based logos**
   - Generate gradient backgrounds from company names
   - Currently using this as fallback

## Testing Checklist

- [x] Seed script creates 5 users
- [x] Seed script creates 12 jobs with metrics
- [x] Jobs page displays logos
- [x] Jobs page shows view/like/apply counts
- [x] Card hover effects work
- [x] Responsive layout on mobile
- [ ] Replace placeholder logos with real ones
- [ ] Test job filtering by category
- [ ] Test job applications (once Application form is built)

## Next Steps

1. **Real Company Logos**: Replace favicon.png with actual company logos
2. **Job Filtering**: Add filters for location, salary, category
3. **Job Search**: Add search functionality
4. **Application Form**: Build the job application form
5. **Analytics**: Track actual view/like/apply metrics
6. **Job Details Page**: Enhance JobDetails.tsx with full job information

## Running Seed Script Again

If you need to:

- **Add more jobs**: Edit `scripts/seedFirestore.js` and add to `sampleJobs` array
- **Add more users**: Edit `testUsers` array
- **Update metrics**: Modify `views`, `likes`, `applies` values

```bash
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\serviceAccountKey.json'
node .\scripts\seedFirestore.js
```

The script is idempotent - it won't create duplicate users, just update existing ones.
