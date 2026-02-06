-- Add detailed fields to RFQs table for Supplier Lead Form
ALTER TABLE public.rfqs
ADD COLUMN IF NOT EXISTS part_name TEXT,
ADD COLUMN IF NOT EXISTS material_size TEXT,
ADD COLUMN IF NOT EXISTS miet_weight NUMERIC,
ADD COLUMN IF NOT EXISTS sample_quantity INTEGER,
ADD COLUMN IF NOT EXISTS sample_lead_time TEXT,
ADD COLUMN IF NOT EXISTS total_process TEXT,
ADD COLUMN IF NOT EXISTS production_remarks TEXT,
ADD COLUMN IF NOT EXISTS job_warnings TEXT,
ADD COLUMN IF NOT EXISTS future_demand_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS future_demand_frequency TEXT[];

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_rfqs_part_name ON public.rfqs(part_name);
