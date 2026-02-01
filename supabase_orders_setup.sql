-- Add columns to rfqs table for Order Management
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS po_file_url TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'In Progress'; -- 'In Progress', 'Dispatched', 'Delivered'
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS proforma_invoice_url TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS final_invoice_url TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS qc_report_url TEXT;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS transport_receipt_url TEXT;

-- Create Order Timeline Table
CREATE TABLE IF NOT EXISTS order_timeline (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  status TEXT DEFAULT 'Completed', -- 'Completed', 'Pending'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for Timeline
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view timeline for their own RFQs" ON order_timeline
  FOR SELECT USING (
    exists (
      select 1 from rfqs
      where rfqs.id = order_timeline.rfq_id
      and rfqs.user_id = auth.uid()
    )
  );

-- Allow Admins to manage timeline (Assuming admin has service role or similar, generic policy for now)
-- You might want to run this in the Supabase Dashboard SQL Editor
