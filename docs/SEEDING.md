Seed Firestore (dev)

This project includes a seed script to populate Firestore with sample users, folios, subscriptions and 20+ realistic job posts.

Prerequisites
- Node 18+ (or compatible)
- Install dependencies in the repo root: `npm install firebase-admin`
 - A Firebase service account JSON. Do NOT commit service account JSON into the repository.
	 Instead provide credentials via environment variables as described below.

Run the seed script

Credentials (recommended):

1) Provide the full service account JSON as an env var (useful for CI):

```bash
export FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account", ... }'
node scripts/seedFirestore.js
```

2) Or provide the base64-encoded JSON (safer when pasting into env files):

```bash
export SERVICE_ACCOUNT_BASE64=$(base64 -w0 path/to/serviceAccount.json)
node scripts/seedFirestore.js
```

3) Or provide a path to the JSON file on your machine (avoid committing this file):

```bash
export SERVICE_ACCOUNT_PATH=/absolute/path/to/serviceAccountKey.json
node scripts/seedFirestore.js
```

Notes
- The script writes directly to your Firestore database. Use a development Firebase project.
 - If you prefer, set `GOOGLE_APPLICATION_CREDENTIALS` instead of `SERVICE_ACCOUNT_PATH`.
- The script will create Auth users using the Admin SDK and create profile documents keyed by UID.

If you want me to run the seed locally (I can't run it from here), tell me the path you'd like to use and I will update the script or instructions accordingly.