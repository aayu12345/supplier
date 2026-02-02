-- ADVANCED PAYMENTS MODULE - CORRECTED
-- Tracks split payments (Advance + Balance) for Orders

-- 1. Create Order Payments Table
CREATE TABLE IF NOT EXISTS public.order_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    
    -- Financials
    currency TEXT DEFAULT 'USD',
    total_amount NUMERIC NOT NULL,
    
    -- Advance Payment Details
    advance_percentage INTEGER DEFAULT 50,
    advance_amount NUMERIC GENERATED ALWAYS AS (total_amount * (advance_percentage / 100.0)) STORED,
    advance_due_date DATE,
    advance_status TEXT DEFAULT 'Pending' CHECK (advance_status IN ('Pending', 'Overdue', 'Paid')),
    advance_paid_date DATE,
    
    -- Balance Payment Details
    balance_percentage INTEGER GENERATED ALWAYS AS (100 - advance_percentage) STORED,
    balance_amount NUMERIC GENERATED ALWAYS AS (total_amount * ((100 - advance_percentage) / 100.0)) STORED,
    balance_due_date DATE,
    balance_status TEXT DEFAULT 'Pending' CHECK (balance_status IN ('Pending', 'Overdue', 'Paid')),
    balance_paid_date DATE,
    
    -- Overall Status
    payment_status TEXT DEFAULT 'Outstanding' CHECK (payment_status IN ('Outstanding', 'Fully Paid')),
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Trigger to Auto-Update Overall Status
CREATE OR REPLACE FUNCTION public.update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.advance_status = 'Paid' AND NEW.balance_status = 'Paid' THEN
        NEW.payment_status := 'Fully Paid';
    ELSE
        NEW.payment_status := 'Outstanding';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_payment_completion ON public.order_payments;
CREATE TRIGGER check_payment_completion
    BEFORE UPDATE ON public.order_payments
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_payment_status();

-- 3. RLS Policies
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;

-- Admins can view/edit everything
-- FIXED: Use @> operator for Array Containment since 'role' is text[]
CREATE POLICY "Admins can manage payments"
ON public.order_payments
TO authenticated
USING ( 
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR 
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) @> ARRAY['admin']
);

-- Buyers can view their own order payments
CREATE POLICY "Buyers can view own payments"
ON public.order_payments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_payments.order_id 
        AND orders.buyer_id = auth.uid()
    )
);
