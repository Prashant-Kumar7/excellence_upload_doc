# Fix: Storage Bucket RLS Policy Error

## Error Message
```
StorageApiError: new row violates row-level security policy
Status: 403 Unauthorized
```

## Problem
The storage bucket `user-documents` doesn't have RLS policies configured, or the policies don't match the file path structure.

## Solution: Create Storage Bucket Policies

### Step 1: Ensure Bucket Exists

1. Go to **Supabase Dashboard** → **Storage**
2. Verify the bucket `user-documents` exists
3. If it doesn't exist, create it:
   - Click **New bucket**
   - Name: `user-documents`
   - **Public bucket**: OFF (we'll use RLS instead)
   - Click **Create bucket**

### Step 2: Create RLS Policies

Go to **Supabase Dashboard** → **SQL Editor** and run this SQL:

```sql
-- Drop existing policies if they exist (optional)
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

-- Policy 1: Users can upload files to their own folder
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Users can view/download their own files
CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'user-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 3: Verify Policies

After running the SQL, verify the policies exist:

1. Go to **Storage** → **Policies**
2. Click on **user-documents** bucket
3. You should see 4 policies listed

### Alternative: Create Policies via UI

If you prefer using the UI:

1. Go to **Storage** → **Policies** → **user-documents**
2. Click **New Policy**
3. For each policy:

**Policy 1: Upload**
- **Policy name:** `Users can upload their own files`
- **Allowed operation:** `INSERT`
- **Policy definition:**
  ```sql
  bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  ```

**Policy 2: View**
- **Policy name:** `Users can view their own files`
- **Allowed operation:** `SELECT`
- **Policy definition:**
  ```sql
  bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  ```

**Policy 3: Delete**
- **Policy name:** `Users can delete their own files`
- **Allowed operation:** `DELETE`
- **Policy definition:**
  ```sql
  bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  ```

## How It Works

The file path structure is: `{userId}/{timestamp}-{filename}.pdf`

The policy checks:
- `bucket_id = 'user-documents'` - Only applies to this bucket
- `auth.uid()::text = (storage.foldername(name))[1]` - First folder matches user ID

Example:
- Path: `099364e2-5367-4f00-a493-f964ea68fb36/1765795166549-file.pdf`
- First folder: `099364e2-5367-4f00-a493-f964ea68fb36`
- Policy checks if this matches `auth.uid()`

## Testing

After creating policies:
1. Try uploading a file
2. Check browser console for errors
3. Verify file appears in Storage → user-documents bucket
4. Verify file appears in your documents list

## Troubleshooting

### Issue 1: Policies Not Created
- Make sure you're running the SQL in the correct project
- Check for any SQL errors in the SQL Editor

### Issue 2: Still Getting 403 Error
- Verify you're logged in (check `auth.uid()` is not null)
- Check that the file path structure matches: `{userId}/...`
- Verify bucket name is exactly `user-documents` (case-sensitive)

### Issue 3: Can't See Files After Upload
- Check SELECT policy exists
- Verify file path in database matches storage path
- Check browser console for download errors

### Debug: Check Current User

Run this SQL to verify authentication:
```sql
SELECT auth.uid();
```

If it returns null, you're not authenticated properly.

### Debug: Test Policy

Test if policy works:
```sql
-- This should return your user ID
SELECT auth.uid()::text;

-- This should show if policy matches
SELECT (storage.foldername('099364e2-5367-4f00-a493-f964ea68fb36/test.pdf'))[1];
```

## Quick Fix Checklist

- [ ] Bucket `user-documents` exists
- [ ] Bucket is NOT public (use RLS instead)
- [ ] All 4 policies created (INSERT, SELECT, DELETE, UPDATE)
- [ ] Policies use correct bucket name: `user-documents`
- [ ] Policies check first folder matches `auth.uid()`
- [ ] User is authenticated (logged in)
- [ ] File path structure is: `{userId}/{filename}`

