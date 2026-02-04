-- PAYMENT & BILLING SYSTEM SETUP
-- Creates tables for supplier invoices, payments, documents, and advance requests

-- 1. SUPPLIER INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.supplier_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Disputed')),
    
    -- Documents
    invoice_url TEXT, -- Uploaded signed invoice PDF
    
    -- Payment tracking
    paid_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SUPPLIER PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.supplier_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES public.supplier_invoices(id) ON DELETE CASCADE,
    
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    amount_paid NUMERIC NOT NULL,
    payment_method TEXT, -- e.g., 'Bank Transfer', 'Cheque', 'UPI'
    transaction_reference TEXT, -- UTR number, cheque number, etc.
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SUPPLIER DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.supplier_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    
    document_type TEXT NOT NULL CHECK (document_type IN ('Transport Receipt', 'QC Report', 'Other')),
    document_url TEXT NOT NULL,
    document_name TEXT,
    
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ADVANCE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.advance_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    requested_amount NUMERIC NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    
    -- Admin response
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. UPDATE SUPPLIER_METRICS TABLE (Add payment-related fields)
DO $$
BEGIN
    -- Add payment_terms_days if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'supplier_metrics' AND column_name = 'payment_terms_days') THEN
        ALTER TABLE public.supplier_metrics ADD COLUMN payment_terms_days INTEGER DEFAULT 45;
    END IF;
    
    -- Add advance_eligible if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'supplier_metrics' AND column_name = 'advance_eligible') THEN
        ALTER TABLE public.supplier_metrics ADD COLUMN advance_eligible BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advance_requests ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES

-- Invoices: Suppliers see only their own
DROP POLICY IF EXISTS "Suppliers can view own invoices" ON public.supplier_invoices;
CREATE POLICY "Suppliers can view own invoices" 
    ON public.supplier_invoices 
    FOR SELECT 
    USING (auth.uid() = supplier_id);

DROP POLICY IF EXISTS "Suppliers can insert own invoices" ON public.supplier_invoices;
CREATE POLICY "Suppliers can insert own invoices" 
    ON public.supplier_invoices 
    FOR INSERT 
    WITH CHECK (auth.uid() = supplier_id);

-- Payments: Suppliers can view payments for their invoices
DROP POLICY IF EXISTS "Suppliers can view own payments" ON public.supplier_payments;
CREATE POLICY "Suppliers can view own payments" 
    ON public.supplier_payments 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.supplier_invoices 
            WHERE id = invoice_id AND supplier_id = auth.uid()
        )
    );

-- Documents: Suppliers manage their own documents
DROP POLICY IF EXISTS "Suppliers manage own documents" ON public.supplier_documents;
CREATE POLICY "Suppliers manage own documents" 
    ON public.supplier_documents 
    FOR ALL 
    USING (auth.uid() = supplier_id);

-- Advance Requests: Suppliers manage their own requests
DROP POLICY IF EXISTS "Suppliers manage own advance requests" ON public.advance_requests;
CREATE POLICY "Suppliers manage own advance requests" 
    ON public.advance_requests 
    FOR ALL 
    USING (auth.uid() = supplier_id);

-- 8. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_supplier_id ON public.supplier_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_status ON public.supplier_invoices(status);
CREATE INDEX IF NOT EXISTS idx_supplier_payments_invoice_id ON public.supplier_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_supplier_documents_supplier_id ON public.supplier_documents(supplier_id);
CREATE INDEX IF NOT EXISTS idx_advance_requests_supplier_id ON public.advance_requests(supplier_id);
CREATE INDEX IF NOT EXISTS idx_advance_requests_status ON public.advance_requests(status);

-- 9. VERIFICATION QUERY
SELECT 
    'supplier_invoices' as table_name,
    COUNT(*) as row_count
FROM public.supplier_invoices
UNION ALL
SELECT 
    'supplier_payments',
    COUNT(*)
FROM public.supplier_payments
UNION ALL
SELECT 
    'supplier_documents',
    COUNT(*)
FROM public.supplier_documents
UNION ALL
SELECT 
    'advance_requests',
    COUNT(*)
FROM public.advance_requests;
