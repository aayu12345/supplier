-- Update ENUM type 'admin_rfq_status' to support Parent-Child Workflow statuses

-- 1. 'Draft' - For Sub-RFQs created but not yet Live
ALTER TYPE public.admin_rfq_status ADD VALUE IF NOT EXISTS 'Draft';

-- 2. 'Drafts Created' - For Parent RFQ when sub-RFQs exist but none live
ALTER TYPE public.admin_rfq_status ADD VALUE IF NOT EXISTS 'Drafts Created';

-- 3. 'Live Running' - For Parent RFQ when at least one sub-RFQ is Live
ALTER TYPE public.admin_rfq_status ADD VALUE IF NOT EXISTS 'Live Running';

-- 4. 'Closed' - For Parent RFQ when all work is done
ALTER TYPE public.admin_rfq_status ADD VALUE IF NOT EXISTS 'Closed';
