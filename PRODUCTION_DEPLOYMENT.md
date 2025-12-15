# Production Deployment - Google OAuth Configuration

## Required Changes for Production

Since your app is deployed at `https://excellence-upload-doc.vercel.app`, you need to update your Google OAuth configuration.

## Step 1: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID (the one you're using for Supabase)
4. Under **Authorized JavaScript origins**, click **+ Add URI** and add:
   ```
   https://excellence-upload-doc.vercel.app
   ```
5. **Keep** `http://localhost:3000` for local development
6. Click **Save**

## Step 2: Verify Redirect URI

The **Authorized redirect URIs** should already be correct:
```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

**Important:** This is the Supabase callback URL, NOT your Vercel domain. This should already be configured correctly.

## Step 3: Update OAuth Consent Screen (If Needed)

1. Go to **APIs & Services** → **OAuth consent screen**
2. Add your production domain to **Authorized domains**:
   - `excellence-upload-doc.vercel.app`
   - `vercel.app` (if not already added)
3. Update **Application home page** if needed:
   - `https://excellence-upload-doc.vercel.app`
4. Save changes

## Step 4: Verify Environment Variables in Vercel

Make sure your Vercel project has the correct environment variables:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Verify these are set:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Make sure they're set for **Production** environment
5. Redeploy if you made changes

## Step 5: Test Production

1. Wait 1-2 minutes for Google OAuth changes to propagate
2. Visit: https://excellence-upload-doc.vercel.app/login
3. Click "Sign in with Google"
4. You should be redirected to Google's consent screen
5. After approval, you should be redirected back to your app

## Summary

✅ **Authorized JavaScript origins** should include:
- `http://localhost:3000` (for local dev)
- `https://excellence-upload-doc.vercel.app` (for production)

✅ **Authorized redirect URIs** should include:
- `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` (Supabase callback)

✅ **OAuth consent screen** should include:
- `excellence-upload-doc.vercel.app` in authorized domains

## Troubleshooting

### Issue: "redirect_uri_mismatch" in production
- Verify the redirect URI in Google Cloud Console matches Supabase callback URL exactly
- The redirect URI is NOT your Vercel domain - it's the Supabase callback URL

### Issue: OAuth works locally but not in production
- Check that production domain is added to Authorized JavaScript origins
- Verify environment variables are set correctly in Vercel
- Check Vercel deployment logs for errors

### Issue: "access_denied" error
- Make sure OAuth consent screen includes your production domain
- If using "External" user type, add your email as a test user
- Wait a few minutes for changes to propagate

