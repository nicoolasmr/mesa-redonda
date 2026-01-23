-- STORAGE SECURITY & RLS POLICIES
-- Multi-tenant isolation for uploaded files

-- Ensure bucket is private
UPDATE storage.buckets SET public = false WHERE id = 'analyzer-uploads';

-- 1. DELETE EXISTING POLICIES (Clean slate)
DROP POLICY IF EXISTS "Workspace owners can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Workspace owners can view files" ON storage.objects;
DROP POLICY IF EXISTS "Workspace owners can delete files" ON storage.objects;

-- 2. CREATE NEW POLICIES
-- Policy: Users can only upload to paths starting with their workspace_id
-- We assume files are saved as: analyzer-uploads/<workspace_id>/<file_name>
CREATE POLICY "Workspace owners can upload to their folder"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'analyzer-uploads' AND
    (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.workspaces WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Workspace owners can read their folder"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'analyzer-uploads' AND
    (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.workspaces WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Workspace owners can delete their files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'analyzer-uploads' AND
    (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.workspaces WHERE owner_id = auth.uid()
    )
);
