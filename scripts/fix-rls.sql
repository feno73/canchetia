-- Fix RLS policies for user registration
-- This should be executed in Supabase SQL Editor

-- First, let's check the current policies and then recreate them

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Anyone can create a user profile" ON usuarios;
DROP POLICY IF EXISTS "Users can view their own profile" ON usuarios;
DROP POLICY IF EXISTS "Users can update their own profile" ON usuarios;

-- Create new, more permissive policies for usuarios table
-- Allow INSERT for authenticated users (this includes users who just signed up)
CREATE POLICY "Allow authenticated users to create profile" ON usuarios
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON usuarios
    FOR SELECT 
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON usuarios
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow users to view all user profiles (for displaying names in reviews, etc.)
CREATE POLICY "Anyone can view user basic info" ON usuarios
    FOR SELECT 
    USING (true);

-- Check if RLS is properly enabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'usuarios';

-- Show current policies
SELECT 
    policyname, 
    cmd, 
    permissive
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'usuarios';