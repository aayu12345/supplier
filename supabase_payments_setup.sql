-- 1. Create Buyer Financials Table (One-to-One with User)
CREATE TABLE IF NOT EXISTS buyer_financials (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  credit_terms TEXT DEFAULT 'Net 30', -- e.g., 'Net 30', 'Advance'
  credit_limit NUMERIC DEFAULT 0,
  outstanding_balance NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rfq_id UUID REFERENCES rfqs(id), -- Optional link to RFQ
  invoice_number TEXT UNIQUE NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('Pending', 'Paid', 'Partially Paid', 'Overdue')) DEFAULT 'Pending',
  issued_date DATE NOT NULL,
  due_date DATE NOT NULL,
  pdf_url TEXT, -- Link to stored PDF
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  invoice_id UUID REFERENCES invoices(id), -- Optional, payment might cover multiple or be advance
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT, -- 'NEFT', 'UPI', 'Credit Card'
  reference_id TEXT, -- Transaction ID
  status TEXT DEFAULT 'Verified', -- 'Verified', 'Pending'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE buyer_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Users can view their own data)
CREATE POLICY "Users can view own financials" ON buyer_financials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

-- 6. Insert Mock Data (Only IF tables are empty to avoid dups)
-- Note: You'll need to replace 'YOUR_USER_ID' with your actual User ID from auth.users if running manually. 
-- Or easier: Run this logic in your app logic once.
-- For now, this SQL script sets up the structure.

-- Example Mock Insert for testing (You can run this part manually with your specific UUID):
/*
INSERT INTO buyer_financials (user_id, credit_terms, credit_limit, outstanding_balance)
VALUES ('fba3d89c-97dc-464b-b1e2-80a5f0c76eed', 'Net 30', 500000, 15000)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO invoices (user_id, invoice_number, amount, status, issued_date, due_date)
VALUES 
('fba3d89c-97dc-464b-b1e2-80a5f0c76eed', 'INV-2024-001', 12500, 'Paid', '2024-01-10', '2024-02-10'),
('fba3d89c-97dc-464b-b1e2-80a5f0c76eed', 'INV-2024-002', 45000, 'Pending', '2024-01-25', '2024-02-25'),
('fba3d89c-97dc-464b-b1e2-80a5f0c76eed', 'INV-2024-003', 3200, 'Overdue', '2023-12-15', '2024-01-15');
*/
