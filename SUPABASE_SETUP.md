# Supabase Database Setup Guide

## Required Environment Variables

Add these to your `.env.local` file (for local development) and in Vercel environment variables (for production):

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

Run these SQL commands in your Supabase SQL Editor to create the required tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('client', 'superadmin', 'worker', 'inspector', 'project_manager')),
    photo TEXT,
    company TEXT,
    created_projects TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (stores project data as JSONB for flexibility)
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_title TEXT NOT NULL,
    status TEXT NOT NULL,
    initial_form JSONB,
    appointment JSONB,
    consultation_notes TEXT,
    proposal JSONB,
    invoice_amount NUMERIC,
    payment_status TEXT CHECK (payment_status IN ('unpaid', 'pending_verification', 'paid', 'failed')),
    concept_design_file TEXT[],
    concept_canva_link TEXT,
    concept_is_approved BOOLEAN DEFAULT FALSE,
    client_approval TEXT CHECK (client_approval IN ('yes', 'no')),
    client_change_request_notes TEXT,
    client_change_request_files TEXT[],
    construction_updates JSONB[] DEFAULT '{}',
    percent_complete INTEGER DEFAULT 0,
    handover_file TEXT,
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability records table
CREATE TABLE IF NOT EXISTS availability (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    date DATE NOT NULL UNIQUE,
    slots TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(date);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read their own data" ON users
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (true);

-- RLS Policies for projects table
CREATE POLICY "Clients can read their own projects" ON projects
    FOR SELECT USING (
        client_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email')
        OR EXISTS (SELECT 1 FROM users WHERE id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email') AND role IN ('superadmin', 'worker', 'project_manager', 'inspector'))
    );

CREATE POLICY "Clients can insert their own projects" ON projects
    FOR INSERT WITH CHECK (
        client_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email')
    );

CREATE POLICY "Staff can insert projects" ON projects
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email') AND role IN ('superadmin', 'worker', 'project_manager'))
    );

CREATE POLICY "Anyone can update projects" ON projects
    FOR UPDATE USING (true);

-- RLS Policies for availability table
CREATE POLICY "Anyone can read availability" ON availability
    FOR SELECT USING (true);

CREATE POLICY "Staff can manage availability" ON availability
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email') AND role IN ('superadmin', 'worker', 'project_manager'))
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for projects table
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
```

## Important Notes

1. **For Development/Testing**: You may want to disable RLS temporarily by running:
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
   ALTER TABLE availability DISABLE ROW LEVEL SECURITY;
   ```

2. **Initial Data**: After creating tables, you can insert the mock data from the old localStorage-based system, or start fresh.

3. **Realtime**: Make sure Realtime is enabled in your Supabase project settings (Dashboard > Settings > API > Realtime)

