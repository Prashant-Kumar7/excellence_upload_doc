# Google OAuth Setup Guide

## Error: "Unsupported provider: provider is not enabled"

This error occurs when Google OAuth is not properly configured in Supabase. Follow these steps to fix it:

## Step 1: Enable Google Provider in Supabase

1. Go to your **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Google** in the list
3. Click on **Google** to open the configuration modal
4. **Enable the toggle** "Enable Sign in with Google" (should be green/ON)

## Step 2: Configure Google Cloud Console

### 2.1 Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type (unless you have a Google Workspace)
   - Fill in required fields (App name, User support email, Developer contact)
   - Add your email to test users if needed
   - Save and continue through the scopes and summary

### 2.2 Create OAuth Client ID

1. Application type: **Web application**
2. Name: e.g., "Supabase Auth Client"
3. **Authorized JavaScript origins:**
   - Add: `http://localhost:3000` (for local development)
   - Add: `https://your-production-domain.com` (for production)
4. **Authorized redirect URIs:**
   - **IMPORTANT:** Use your Supabase callback URL:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Example: `https://myhhpipzzynotsqraczk.supabase.co/auth/v1/callback`
   - **DO NOT** use `http://localhost:3000/api/auth/callback/google` - that's incorrect!

5. Click **Create**
6. **Copy the Client ID** and **Client Secret** (you'll need these for Supabase)

## Step 3: Configure Supabase with Google Credentials

1. Go back to **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. Paste your **Client ID** from Google Cloud Console into the "Client IDs" field
3. Paste your **Client Secret** into the "Client Secret (for OAuth)" field
4. Verify the **Callback URL** matches what you added in Google Cloud Console:
   - Should be: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
5. Click **Save**

## Step 4: Verify Configuration

### Check Supabase Settings:
- ✅ "Enable Sign in with Google" toggle is ON
- ✅ Client ID is filled in
- ✅ Client Secret is filled in
- ✅ Callback URL matches Google Cloud Console

### Check Google Cloud Console:
- ✅ Authorized redirect URI matches Supabase callback URL exactly
- ✅ OAuth consent screen is configured
- ✅ Client ID and Secret are active

## Common Issues

### Issue 1: Redirect URI Mismatch
**Error:** "redirect_uri_mismatch"
**Solution:** Ensure the redirect URI in Google Cloud Console exactly matches:
```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

### Issue 2: Provider Not Enabled
**Error:** "Unsupported provider: provider is not enabled"
**Solution:** 
- Make sure the toggle in Supabase is ON
- Refresh the page and try again
- Check that Client ID and Secret are saved

### Issue 3: Invalid Credentials
**Error:** "invalid_client" or "unauthorized_client"
**Solution:**
- Verify Client ID and Secret are correct
- Make sure you copied the entire Client ID (it's long)
- Check that the OAuth client is not deleted in Google Cloud Console

### Issue 4: OAuth Consent Screen Not Configured
**Error:** "access_denied"
**Solution:**
- Complete the OAuth consent screen setup in Google Cloud Console
- Add your email as a test user if using "External" user type
- Wait a few minutes for changes to propagate

## Testing

1. After configuration, wait 1-2 minutes for changes to propagate
2. Try signing in with Google on your app
3. You should be redirected to Google's consent screen
4. After approval, you'll be redirected back to your app

## Production Setup

For production, make sure to:

1. Add your production domain to **Authorized JavaScript origins** in Google Cloud Console
2. Update the OAuth consent screen with your production domain
3. Consider verifying your domain with Google for better trust
4. Review and publish your OAuth consent screen if needed

## Security Notes

- Never commit Client Secrets to version control
- Use environment variables for sensitive data
- Regularly rotate Client Secrets
- Monitor OAuth usage in Google Cloud Console
- Set up proper RLS policies in Supabase

## Need Help?

If you're still having issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check browser console for detailed error messages
3. Verify all URLs match exactly (no trailing slashes, correct protocol)
4. Ensure your Supabase project URL is correct

