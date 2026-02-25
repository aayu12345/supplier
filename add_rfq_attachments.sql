-- Migration: Add JSONB column for multiple file attachments
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Comment on column
COMMENT ON COLUMN rfqs.attachments IS 'Array of objects containing file metadata: [{"name": "file.pdf", "url": "https://..."}]';
