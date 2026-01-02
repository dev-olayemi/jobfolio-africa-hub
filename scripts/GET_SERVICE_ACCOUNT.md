# How to Get Your Service Account JSON File

The `GOOGLE_APPLICATION_CREDENTIALS` is a path to a **service account JSON file** that gives your seed script permission to write to your Firebase database.

## Step-by-Step Guide

### Step 1: Open Firebase Console

1. Go to https://console.firebase.google.com/
2. Click on your project (jobfolio-f5b8c or whatever your project name is)

### Step 2: Navigate to Service Accounts

1. In the top-left, click the **⚙️ Settings icon** (gear icon)
2. Select **"Project Settings"**

![Screenshot: Click settings gear icon](https://via.placeholder.com/400x100?text=Click+Gear+Icon+Top+Right)

### Step 3: Go to Service Accounts Tab

1. Look for the **"Service Accounts"** tab at the top
2. Click it

![Screenshot: Service Accounts Tab](https://via.placeholder.com/400x100?text=Service+Accounts+Tab)

### Step 4: Generate Private Key

1. You should see a section labeled **"Firebase Admin SDK"**
2. Click the button **"Generate New Private Key"** (or "Generate Key")

![Screenshot: Generate New Private Key Button](https://via.placeholder.com/400x200?text=Generate+New+Private+Key)

## Step 5: Download and Provide Credentials Securely

1. A JSON file will automatically download (usually named something like `jobfolio-f5b8c-xxx.json`).
2. Preferred: do NOT store this file in the repository. Instead, provide credentials via environment variables:

    - Full JSON string (useful for CI):

       ```bash
       export FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account", ... }'
       ```

    - Base64 encoded JSON (safe for env files):

       ```bash
       export SERVICE_ACCOUNT_BASE64=$(base64 -w0 path/to/serviceAccount.json)
       ```

    - Or (less preferred) provide the absolute file path on your machine:

       ```bash
       export SERVICE_ACCOUNT_PATH=/absolute/path/to/serviceAccountKey.json
       ```

3. If you must save the JSON file locally, keep it out of version control by adding it to `.gitignore`:

    ```text
    scripts/serviceAccountKey.json
    jobfolio-*.json
    ```

## Your File Should Look Like This

The JSON file will have this structure (with real values filled in):

```json
{
  "type": "service_account",
  "project_id": "jobfolio-f5b8c",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxx@jobfolio-f5b8c.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## Now Run the Seed Script

Once you have the file saved, open **PowerShell** and run:

```powershell
# Set the path to your service account file
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\Users\YourUsername\Documents\GitHub\jobfolio-africa-hub\scripts\serviceAccountKey.json'

# Install the dependency (one-time)
npm install firebase-admin

# Run the seed script
node .\scripts\seedFirestore.js
```

**Expected Output:**

```
Created auth user: alice@example.com (uid=FrUJn1C3SeR29n1rW3XhNgPs34v1)
Wrote profile for uid=FrUJn1C3SeR29n1rW3XhNgPs34v1
Created folio for uid=FrUJn1C3SeR29n1rW3XhNgPs34v1
Created subscription for uid=FrUJn1C3SeR29n1rW3XhNgPs34v1
Wrote job job_frontend_1
Wrote job job_product_1
... (more jobs)
Seed completed.
```

## Troubleshooting

### "Service account file not found"

- Check the path is correct
- Make sure you saved the JSON file in that location
- Try using the full absolute path (C:\Users\...)

### "Permission denied" or "You do not have permission"

- The service account may not have the right permissions
- Go to Google Cloud Console (cloud.google.com) → Your Project → IAM
- Find the service account email (from the JSON: `client_email`)
- Make sure it has "Editor" or "Firebase Admin" role

### "ENOENT: no such file or directory"

- The path to the JSON file is wrong
- Double-check the file path in the PowerShell command
- Use the exact path where you saved the file

## Security Tips

⚠️ **CRITICAL:**

1. **Never commit the JSON file to git**

   - Add to `.gitignore`: `scripts/serviceAccountKey.json`
   - If accidentally committed, regenerate the key immediately in Firebase Console

2. **Keep it private**

   - Don't share the file with anyone
   - Don't post it in chat or send it in emails

3. **For team development**

   - Each developer gets their own service account key
   - Store securely (e.g., in a password manager or team secret store)

4. **For production**
   - Use Firebase Service Account with minimal permissions (not Editor)
   - Use environment variables to load the path (never hardcode it)
   - Rotate keys regularly

## Still Stuck?

If you can't find the Service Accounts section:

1. Make sure you're logged into the correct Google account
2. Make sure you're viewing the correct Firebase project
3. Try clicking the **gear icon ⚙️ → Project Settings** again
4. Look for tabs at the top: you should see "General", "Service Accounts", "Cloud Messaging", etc.
