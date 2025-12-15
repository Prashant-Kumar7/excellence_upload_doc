# Document Upload System

A Next.js application for uploading documents (PDF and DOCX) with text extraction capabilities using Supabase.

## Features

- ✅ Google OAuth authentication via Supabase
- ✅ Document upload (PDF and DOCX only, max 10MB)
- ✅ Text extraction from PDF (using pdf2json) and DOCX (using mammoth) files
- ✅ Document listing with upload date
- ✅ Download documents
- ✅ View extracted text in a modal
- ✅ Light/Dark/System theme support
- ✅ Responsive UI using shadcn components
- ✅ Row Level Security (RLS) for data protection

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Google OAuth credentials (for authentication)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Note your project URL and anon key from **Settings > API**

#### Create the Database Table

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the SQL migration file located at `supabase/migrations/001_create_documents_table.sql`
   - This creates the `documents` table with proper RLS policies

#### Create Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket named `user-documents`
3. Make it **private** (we'll use RLS policies)
4. Go to **Storage > Policies** and create these policies for the `user-documents` bucket:

**Policy 1: Upload files**
- Policy name: `Users can upload their own files`
- Allowed operation: `INSERT`
- Policy definition:
  ```sql
  bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  ```

**Policy 2: View files**
- Policy name: `Users can view their own files`
- Allowed operation: `SELECT`
- Policy definition:
  ```sql
  bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  ```

**Policy 3: Delete files**
- Policy name: `Users can delete their own files`
- Allowed operation: `DELETE`
- Policy definition:
  ```sql
  bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  ```

**Or run this SQL in SQL Editor:**
```sql
-- Storage bucket policies
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Configure Google OAuth

1. **Enable Google Provider in Supabase:**
   - Go to **Authentication > Providers** in Supabase dashboard
   - Find **Google** and click on it
   - **Enable the toggle** "Enable Sign in with Google" (should be green/ON)

2. **Get OAuth Credentials from Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project (or create a new one)
   - Navigate to **APIs & Services > Credentials**
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - If prompted, configure the OAuth consent screen first:
     - Choose **External** user type (unless you have a Google Workspace)
     - Fill in required fields (App name, User support email, Developer contact)
     - Add your email to test users if needed
   - Create OAuth Client ID:
     - Application type: **Web application**
     - Name: e.g., "Supabase Auth Client"
     - **Authorized JavaScript origins:** Add `http://localhost:3000` (for local development)
     - **Authorized redirect URIs:** **CRITICAL** - Add your Supabase callback URL:
       ```
       https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
       ```
       Example: `https://myhhpipzzynotsqraczk.supabase.co/auth/v1/callback`
     - Click **Create**
     - Copy the **Client ID** and **Client Secret**

3. **Configure Supabase with Google Credentials:**
   - Go back to **Supabase Dashboard > Authentication > Providers > Google**
   - Paste your **Client ID** into the "Client IDs" field
   - Paste your **Client Secret** into the "Client Secret (for OAuth)" field
   - Verify the **Callback URL** matches what you added in Google Cloud Console
   - Click **Save**

4. **For Production Deployment:**
   - Add your production domain to **Authorized JavaScript origins** in Google Cloud Console
   - Example: `https://excellence-upload-doc.vercel.app`
   - Keep `http://localhost:3000` for local development
   - The redirect URI remains the Supabase callback URL (not your Vercel domain)

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://excellence-upload-doc.vercel.app
```

Replace with your actual Supabase credentials from **Settings > API**.

**Important for Production:**
- Add `NEXT_PUBLIC_SITE_URL` to your Vercel environment variables (Production environment)
- Set it to your production domain: `https://excellence-upload-doc.vercel.app`
- Also update **Supabase Dashboard > Settings > API > Site URL** to your production domain

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── documents/          # API route for saving documents
│   │   └── extract-text/       # API route for text extraction
│   ├── auth/
│   │   └── callback/           # OAuth callback handler
│   ├── dashboard/              # Dashboard page (protected)
│   ├── login/                  # Login page
│   └── page.tsx                # Root page (redirects)
├── components/
│   ├── theme-provider.tsx      # Theme provider wrapper
│   ├── theme-toggle.tsx        # Theme switcher component
│   └── ui/                     # shadcn UI components
├── lib/
│   ├── supabase/               # Supabase client utilities
│   └── utils/
│       ├── sanitize-filename.ts # Filename sanitization
│       └── text-extraction.ts  # PDF/DOCX extraction utilities
├── proxy.ts                    # Next.js proxy (replaces middleware)
├── supabase/
│   └── migrations/             # Database migrations
└── types/
    └── database.types.ts       # TypeScript types
```

## Database Schema

The `documents` table has the following structure:

- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `file_path` (TEXT) - Path in storage bucket
- `original_filename` (TEXT)
- `extracted_text` (TEXT) - Extracted text content
- `uploaded_at` (TIMESTAMP)

## Storage Structure

Files are stored in the `user-documents` bucket with the following structure:
```
user-documents/
  └── {userId}/
      └── {timestamp}-{filename}.pdf
```

## Troubleshooting

### Authentication Issues

**Error: "Unsupported provider: provider is not enabled"**
- Make sure the Google provider toggle is ON in Supabase
- Verify Client ID and Secret are filled in and saved
- Check that redirect URI in Google Cloud Console matches Supabase callback URL exactly

**Error: Project URL mismatch**
- Ensure `.env.local` uses the same Supabase project as configured in Google Cloud Console
- All three should match:
  - `.env.local` → `NEXT_PUBLIC_SUPABASE_URL`
  - Google Cloud Console → Authorized redirect URI
  - Supabase Dashboard → Google Provider → Callback URL

### File Upload Issues

**Error: "new row violates row-level security policy"**
- Verify RLS policies exist for the `documents` table (run migration SQL)
- Check storage bucket policies exist (see Storage setup above)
- Ensure user is authenticated (logged in)

**Error: "Invalid key"**
- Filenames are automatically sanitized to remove special characters
- This is handled automatically by the application

### Text Extraction Issues

- PDF extraction uses `pdf2json` - works in Node.js without DOM APIs
- DOCX extraction uses `mammoth` - requires Buffer (handled automatically)
- Both libraries are installed and configured

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Authentication:** Supabase Auth (Google OAuth)
- **UI:** shadcn/ui components, Tailwind CSS
- **PDF Parsing:** pdf2json
- **DOCX Parsing:** mammoth
- **Theming:** next-themes

## License

This project is private and proprietary.
