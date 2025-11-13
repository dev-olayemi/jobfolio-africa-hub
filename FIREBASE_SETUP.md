# Firebase Setup Guide for JobFolio Africa

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name it "JobFolio Africa"
4. Follow the setup wizard
5. Once created, click on the web icon (</>) to add a web app
6. Register your app with the nickname "JobFolio Africa Web"
7. Copy the Firebase configuration values

## 2. Configure Environment Variables

Create a `.env.local` file in the project root with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 3. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. (Optional) Enable **Google** sign-in if desired

## 4. Create Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click **Create Database**
3. Choose **Start in production mode**
4. Select a location close to your users (e.g., `africa-south1`)

## 5. Firestore Collections Structure

### Collection: `profiles`
```
profiles/{userId}
- email: string
- firstName: string
- lastName: string
- phoneNumber?: string
- profilePictureUrl?: string
- createdAt: timestamp
- updatedAt: timestamp
```

### Collection: `folios`
```
folios/{folioId}
- userId: string
- cvUrl: string
- cvFileName: string
- industries: array<string>
- createdAt: timestamp
- updatedAt: timestamp
```

### Collection: `subscriptions`
```
subscriptions/{userId}
- userId: string
- status: string (trial | active | expired | cancelled)
- trialStartDate?: timestamp
- trialEndDate?: timestamp
- subscriptionStartDate?: timestamp
- subscriptionEndDate?: timestamp
- createdAt: timestamp
- updatedAt: timestamp
```

### Collection: `jobs`
```
jobs/{jobId}
- title: string
- company: string
- location: string
- country: string
- salary: string
- category: string
- description: string
- requirements: array<string>
- responsibilities: array<string>
- contactEmail?: string
- contactPhone?: string
- applicationUrl?: string
- postedAt: timestamp
- expiresAt?: timestamp
- isActive: boolean
- createdAt: timestamp
- updatedAt: timestamp
```

### Collection: `applications`
```
applications/{applicationId}
- userId: string
- jobId: string
- status: string (pending | reviewed | accepted | rejected)
- appliedAt: timestamp
- reviewedAt?: timestamp
- notes?: string
```

### Collection: `advertisements`
```
advertisements/{adId}
- title: string
- videoUrl: string
- duration: number
- advertiserName: string
- targetUrl?: string
- isActive: boolean
- displayOrder: number
- createdAt: timestamp
- updatedAt: timestamp
```

## 6. Firestore Security Rules

In Firebase Console, go to **Firestore Database** > **Rules** and paste this:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Profiles - users can read/write their own profile
    match /profiles/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update, delete: if isOwner(userId);
    }
    
    // Folios - users can read/write their own folio
    match /folios/{folioId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
    
    // Subscriptions - users can read their own subscription
    match /subscriptions/{subscriptionId} {
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow delete: if false; // Subscriptions should not be deleted
    }
    
    // Jobs - everyone can read active jobs, only admins can write
    match /jobs/{jobId} {
      allow read: if resource.data.isActive == true;
      allow create, update, delete: if false; // Use admin SDK or Cloud Functions
    }
    
    // Applications - users can read/write their own applications
    match /applications/{applicationId} {
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow delete: if false; // Applications should not be deleted
    }
    
    // Advertisements - everyone can read active ads, only admins can write
    match /advertisements/{adId} {
      allow read: if resource.data.isActive == true;
      allow create, update, delete: if false; // Use admin SDK or Cloud Functions
    }
  }
}
\`\`\`

## 7. Enable Firebase Storage

1. Go to **Storage** in Firebase Console
2. Click **Get Started**
3. Choose **Start in production mode**
4. Select the same location as your Firestore

## 8. Storage Security Rules

In Firebase Console, go to **Storage** > **Rules** and paste this:

\`\`\`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // CVs - users can upload their own CV
    match /cvs/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // 5MB limit
                   && request.resource.contentType.matches('application/pdf|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
    
    // Profile pictures - users can upload their own profile picture
    match /profile-pictures/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 2 * 1024 * 1024 // 2MB limit
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Advertisements - only admins can upload (use Cloud Functions)
    match /advertisements/{fileName} {
      allow read: if true;
      allow write: if false;
    }
  }
}
\`\`\`

## 9. Add Sample Data (Optional)

You can add sample jobs manually in the Firestore Console to test the application:

1. Go to **Firestore Database**
2. Click **Start collection**
3. Collection ID: `jobs`
4. Add documents with the structure mentioned above

## 10. TypeScript Types for Firebase

All TypeScript types are defined in `src/lib/firebase-types.ts`:
- UserProfile
- Folio
- Subscription
- Job
- Application
- Advertisement

## 11. Environment Setup Complete

After completing these steps:
1. Restart your development server
2. The authentication and database features will work
3. Users can sign up, sign in, build folios, and view jobs
4. Admin panel will need to be set up separately for managing jobs

## Next Steps

- Set up Cloud Functions for:
  - Sending trial activation emails
  - Automatically expiring trials/subscriptions
  - Processing payments
  - Managing job postings
- Integrate payment gateway (Stripe, Paystack, or Flutterwave)
- Create admin panel for job management
- Set up email notifications
