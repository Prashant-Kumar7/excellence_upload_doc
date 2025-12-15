# Fix: Row Level Security (RLS) Policy Error

## Error Message
```
StorageApiError: new row violates row-level security policy
```

## Problem
The RLS policy is blocking the insert because the client-side Supabase call doesn't have proper authentication context, or the policies aren't set up correctly.

## Solution 1: Use Server-Side API Route (Implemented)

I've created a server-side API route (`/api/documents`) that has proper authentication context. This is now being used automatically.

## Solution 2: Verify RLS Policies in Supabase

If you're still getting errors, verify your RLS policies:

1. Go to **Supabase Dashboard** → **Table Editor** → **documents** table
2. Click on **Policies** tab
3. Verify these policies exist:

### Policy 1: "Users can insert their own documents"
- **Policy name:** `Users can insert their own documents`
- **Allowed operation:** `INSERT`
- **Policy definition:**
  ```sql
  WITH CHECK (auth.uid() = user_id)
  ```

### Policy 2: "Users can view their own documents"
- **Policy name:** `Users can view their own documents`
- **Allowed operation:** `SELECT`
- **Policy definition:**
  ```sql
  USING (auth.uid() = user_id)
  ```

### Policy 3: "Users can update their own documents"
- **Policy name:** `Users can update their own documents`
- **Allowed operation:** `UPDATE`
- **Policy definition:**
  ```sql
  USING (auth.uid() = user_id)
  ```

### Policy 4: "Users can delete their own documents"
- **Policy name:** `Users can delete their own documents`
- **Allowed operation:** `DELETE`
- **Policy definition:**
  ```sql
  USING (auth.uid() = user_id)
  ```

## Solution 3: Re-run Migration SQL

If policies are missing, run this SQL in **Supabase Dashboard** → **SQL Editor**:

```sql
-- Drop existing policies if they exist (optional, will error if they don't exist)
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;

-- Create policy: Users can only see their own documents
CREATE POLICY "Users can view their own documents"
  ON documents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own documents
CREATE POLICY "Users can insert their own documents"
  ON documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own documents
CREATE POLICY "Users can update their own documents"
  ON documents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
  ON documents
  FOR DELETE
  USING (auth.uid() = user_id);
```

## Solution 4: Check Storage Bucket Policies

Also verify your storage bucket has proper RLS policies:

1. Go to **Storage** → **Policies** → **user-documents** bucket
2. Create these policies:

### Storage Policy 1: "Users can upload their own files"
- **Policy name:** `Users can upload their own files`
- **Allowed operation:** `INSERT`
- **Policy definition:**
  ```sql
  bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  ```

### Storage Policy 2: "Users can view their own files"
- **Policy name:** `Users can view their own files`
- **Allowed operation:** `SELECT`
- **Policy definition:**
  ```sql
  bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  ```

### Storage Policy 3: "Users can delete their own files"
- **Policy name:** `Users can delete their own files`
- **Allowed operation:** `DELETE`
- **Policy definition:**
  ```sql
  bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  ```

## Testing

After fixing:
1. Make sure you're logged in
2. Try uploading a file
3. Check browser console for any errors
4. Verify the file appears in your documents list

## Common Issues

### Issue 1: Policies Not Created
**Solution:** Run the migration SQL again in Supabase SQL Editor

### Issue 2: auth.uid() Returns Null
**Solution:** 
- Make sure user is properly authenticated
- Check that session is valid
- Try logging out and logging back in

### Issue 3: user_id Mismatch
**Solution:** The API route now handles this automatically by using server-side auth context

## Debugging

To debug RLS issues:

1. **Check current user:**
   ```sql
   SELECT auth.uid();
   ```

2. **Check if policies exist:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'documents';
   ```

3. **Test insert manually:**
   ```sql
   INSERT INTO documents (user_id, file_path, original_filename)
   VALUES (auth.uid(), 'test/path.pdf', 'test.pdf');
   ```

If manual insert works but app doesn't, it's likely an auth context issue (which the API route fixes).

