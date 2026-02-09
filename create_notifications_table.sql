-- Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 1. Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- 2. Users can mark their own notifications as read (update)
CREATE POLICY "Users can update own notifications"
ON notifications
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
);

-- 3. Admins/System can insert notifications for anyone
-- We use a function or service role for insertion usually, 
-- but we can allow authenticated users to insert if they are admins.
CREATE POLICY "Admins can insert notifications"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND 'admin' = ANY(profiles.role)
    )
);

-- 4. Service Role can do anything
CREATE POLICY "Service role can manage notifications"
ON notifications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
