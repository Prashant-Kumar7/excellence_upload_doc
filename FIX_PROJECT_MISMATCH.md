# Fix: Project URL Mismatch

## Problem Identified

Your error shows you're using Supabase project: `vtfjljggvsvueymfvoxa.supabase.co`

But your Google Cloud Console and Supabase dashboard are configured for: `myhhpipzzynotsqraczk.supabase.co`

**These don't match!** That's why you're getting the error.

## Solution: Choose One Project

You have two options:

### Option 1: Use the Project Already Configured (Recommended)

If you want to use `myhhpipzzynotsqraczk` (the one already set up):

1. **Update your `.env.local` file:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://myhhpipzzynotsqraczk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_for_myhhpipzzynotsqraczk
   ```

2. **Get the anon key:**
   - Go to Supabase Dashboard → Project Settings → API
   - Copy the `anon` `public` key for project `myhhpipzzynotsqraczk`
   - Paste it in `.env.local`

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

### Option 2: Configure Google OAuth for Current Project

If you want to use `vtfjljggvsvueymfvoxa` (the one in the error):

1. **Add redirect URI to Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to your OAuth client
   - Under "Authorized redirect URIs", click "+ Add URI"
   - Add: `https://vtfjljggvsvueymfvoxa.supabase.co/auth/v1/callback`
   - Click **Save**

2. **Configure Supabase for this project:**
   - Go to Supabase Dashboard for project `vtfjljggvsvueymfvoxa`
   - Navigate to Authentication → Providers → Google
   - Enable the toggle
   - Add your Client ID: `755506344614-ngaqajqp50r6td11hjc26j8ad56k2u0o.apps.googleusercontent.com`
   - Add your Client Secret (the one from Google Cloud Console)
   - Verify Callback URL shows: `https://vtfjljggvsvueymfvoxa.supabase.co/auth/v1/callback`
   - Click **Save**

3. **Verify your `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://vtfjljggvsvueymfvoxa.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_for_vtfjljggvsvueymfvoxa
   ```

## Quick Check

After fixing, verify these match:

✅ **`.env.local`** → `NEXT_PUBLIC_SUPABASE_URL`  
✅ **Google Cloud Console** → Authorized redirect URI  
✅ **Supabase Dashboard** → Google Provider → Callback URL  

All three should have the **same project reference**!

## How to Find Your Current Project

1. Check your `.env.local` file (if it exists)
2. Or check the error URL - it shows which project you're using
3. Or check browser console/network tab when the error occurs

## After Fixing

1. Wait 1-2 minutes for changes to propagate
2. Restart your dev server (`npm run dev`)
3. Clear browser cache/cookies for localhost:3000
4. Try signing in again

