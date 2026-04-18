-- Migration: Admin Setup
-- Adds roles to profiles and creates a system logs table.

-- 1. Create Role Enum
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
    END IF;
END $$;

-- 2. Add Role to Profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- 3. Create System Logs Table
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 4. Enable RLS on System Logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with logs
CREATE POLICY "Admins can view system logs" 
ON public.system_logs 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Simple logging function
CREATE OR REPLACE FUNCTION public.log_system_event(
    p_event_type TEXT,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.system_logs (user_id, event_type, description, metadata)
    VALUES (auth.uid(), p_event_type, p_description, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Set Initial Admins
UPDATE public.profiles 
SET role = 'admin' 
WHERE email IN (
    'dibyanshu.singh2004@gmail.com', 
    'dexisforreal@gmail.com'
);
