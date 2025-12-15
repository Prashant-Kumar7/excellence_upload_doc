# Document Upload System - Setup Guide

This is a Next.js application for uploading documents (PDF and DOCX) with text extraction capabilities using Supabase.

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Google OAuth credentials (for authentication)

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Note your project URL and anon key from Settings > API

#### Create the Database Table

1. Go to SQL Editor in your Supabase dashboard
2. Run the SQL migration file located at `supabase/migrations/001_create_documents_table.sql`
   - This creates the `documents` table with proper RLS policies

#### Create Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `user-documents`
3. Make it **public** or set up proper RLS policies
4. For RLS, create a policy:
   - Policy name: "Users can upload their own files"
   - Allowed operation: INSERT
   - Policy definition: `bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]`
   - Policy name: "Users can view their own files"
   - Allowed operation: SELECT
   - Policy definition: `bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]`

#### Configure Google OAuth

**⚠️ IMPORTANT:** See `GOOGLE_OAUTH_SETUP.md` for detailed step-by-step instructions.

Quick steps:
1. Go to Authentication > Providers in Supabase dashboard
2. Enable Google provider (toggle must be ON)
3. Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/):
   - Create OAuth 2.0 Client ID (Web application type)
   - **CRITICAL:** Add authorized redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase
4. Save the configuration in Supabase

**Common Error:** If you see "Unsupported provider: provider is not enabled", make sure:
- The toggle in Supabase is ON (green)
- Client ID and Secret are filled in and saved
- Redirect URI in Google Cloud Console matches Supabase callback URL exactly

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace with your actual Supabase credentials.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- ✅ Google OAuth authentication via Supabase
- ✅ Document upload (PDF and DOCX only, max 10MB)
- ✅ Text extraction from PDF and DOCX files
- ✅ Document listing with upload date
- ✅ Download documents
- ✅ View extracted text in a modal
- ✅ Responsive UI using shadcn components
- ✅ Row Level Security (RLS) for data protection

## Project Structure

```
├── app/
│   ├── api/
│   │   └── extract-text/     # API route for text extraction
│   ├── auth/
│   │   └── callback/          # OAuth callback handler
│   ├── dashboard/             # Dashboard page (protected)
│   ├── login/                 # Login page
│   └── page.tsx               # Root page (redirects)
├── components/
│   └── ui/                    # shadcn UI components
├── lib/
│   ├── supabase/              # Supabase client utilities
│   └── utils/                 # Utility functions (text extraction)
├── middleware.ts              # Auth middleware
└── supabase/
    └── migrations/            # Database migrations
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

- Ensure Google OAuth is properly configured in Supabase
- Check that redirect URIs match in both Google Cloud Console and Supabase

### File Upload Issues

- Verify the storage bucket exists and is named `user-documents`
- Check RLS policies are set correctly
- Ensure file size is under 10MB

### Text Extraction Issues

- Verify `pdf-parse` and `mammoth` packages are installed
- Check that files are valid PDF or DOCX format

## License

This project is private and proprietary.

