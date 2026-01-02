Seed Firestore (dev)

This project includes a seed script to populate Firestore with sample users, folios, subscriptions and 20+ realistic job posts.

Prerequisites
- Node 18+ (or compatible)
- Install dependencies in the repo root: `npm install firebase-admin`
- A Firebase service account JSON (the repository may include `jobfolio-f5b8c-firebase-adminsdk-fbsvc-bb6425bed8.json`).

Run the seed script

Windows (PowerShell):

```powershell
$env:SERVICE_ACCOUNT_PATH = "C:\Users\user\Documents\GitHub\jobfolio-africa-hub\jobfolio-f5b8c-firebase-adminsdk-fbsvc-bb6425bed8.json"
node scripts/seedFirestore.js
```

macOS / Linux:

```bash
export SERVICE_ACCOUNT_PATH=/absolute/path/to/jobfolio-f5b8c-firebase-adminsdk-fbsvc-bb6425bed8.json
node scripts/seedFirestore.js
```

Notes
- The script writes directly to your Firestore database. Use a development Firebase project.
- If you prefer, set `GOOGLE_APPLICATION_CREDENTIALS` instead of `SERVICE_ACCOUNT_PATH`.
- The script will create Auth users using the Admin SDK and create profile documents keyed by UID.

If you want me to run the seed locally (I can't run it from here), tell me the path you'd like to use and I will update the script or instructions accordingly.