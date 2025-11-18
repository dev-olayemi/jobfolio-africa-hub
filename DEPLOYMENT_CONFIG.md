# Deployment Configuration Guide

## Production Environment Setup

### Vercel Deployment

For the app to work properly on Vercel production, you need to set environment variables:

#### 1. Filestack Configuration

- **Variable:** `VITE_FILESTACK_API_KEY`
- **Value:** Your Filestack API key (provided: `AVcRfQz9YSQuF6JtXlFsQz`)
- **Purpose:** Enables profile picture uploads using Filestack's service

**Steps to add to Vercel:**

1. Go to your Vercel project dashboard
2. Navigate to: Settings → Environment Variables
3. Add new variable:
   - Name: `VITE_FILESTACK_API_KEY`
   - Value: `AVcRfQz9YSQuF6JtXlFsQz`
   - Scope: Select `Production` (and `Preview` if needed for testing)
4. Click "Save"
5. Trigger a new deployment (redeploy from git or manually)

#### 2. Cloudinary Configuration (Optional)

If using Cloudinary for additional image processing:

- **Variable:** `VITE_CLOUDINARY_CLOUD_NAME`
- **Value:** Your Cloudinary cloud name
- **Variable:** `VITE_CLOUDINARY_UPLOAD_PRESET`
- **Value:** Your unsigned upload preset name

#### 3. Firebase Configuration (Usually already set)

Firebase config should already be configured in your Vercel environment if the app is deployed. If not:

- Add `VITE_FIREBASE_API_KEY`
- Add `VITE_FIREBASE_AUTH_DOMAIN`
- Add `VITE_FIREBASE_PROJECT_ID`
- Add `VITE_FIREBASE_STORAGE_BUCKET`

### Local Development

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Ensure `VITE_FILESTACK_API_KEY` is set in `.env.local`

3. Restart dev server for changes to take effect:
   ```bash
   npm run dev
   ```

## Troubleshooting

### File Picker Not Opening on Production

**Issue:** "Filestack API key not configured" error

**Solution:**

1. Verify environment variable is set in Vercel:
   - Go to Vercel → Project Settings → Environment Variables
   - Check `VITE_FILESTACK_API_KEY` exists
2. Redeploy the application after adding/updating env var
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try the feature again

### Images Not Loading in Production

**Issue:** Profile picture or uploaded images show broken image icon

**Possible causes:**

1. Filestack handle is invalid or expired
2. CORS issues with Filestack CDN
3. Image URL is malformed

**Solutions:**

1. Check browser console for exact error URL
2. Try uploading a new image
3. Ensure image URL follows format: `https://cdn.filestackcontent.com/{handle}`

### Upload Dialog Not Appearing

**Issue:** Click upload button but picker doesn't open

**Possible causes:**

1. Filestack SDK not loading (network issue)
2. API key not configured
3. JavaScript errors in console

**Solutions:**

1. Check browser console for errors (F12)
2. Verify internet connection
3. Try different browser or incognito mode
4. Wait 2-3 seconds after clicking (SDK loads async)

## Security Notes

⚠️ **Important:**

- The Filestack API key shown here is a test/demo key
- For production with sensitive data, consider using server-side authentication
- Never expose your Filestack Secret in client-side code
- Store Filestack credentials in Vercel's private environment variables only

## Monitoring

To check if features are working:

1. **Profile Picture Upload:**

   - Click profile avatar in profile page
   - Select "Upload Picture"
   - File picker should open
   - Image should display after upload

2. **CV Download:**

   - Go to profile page
   - Click "Download CV" button
   - PDF should download with your profile info

3. **Job Application:**
   - Browse jobs and click "Apply"
   - Review modal should appear on desktop
   - Application should submit and show success message

## Support

For issues with:

- **Filestack:** Visit https://www.filestack.com/docs/
- **Vercel:** Visit https://vercel.com/docs
- **This app:** Check the repository issues
