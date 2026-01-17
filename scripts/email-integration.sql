
-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    email TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'order_confirmation'
    order_id UUID REFERENCES public.orders(id),
    content JSONB,
    status TEXT DEFAULT 'pending' -- 'pending', 'sent', 'failed'
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert notifications (from the frontend)
-- In a more strict setup, this would be done via a database trigger or service role
CREATE POLICY "Users can insert their own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);
