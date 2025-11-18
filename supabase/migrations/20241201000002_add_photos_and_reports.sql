-- Add photo support and user reports
ALTER TABLE incidents ADD COLUMN photo_url TEXT;

-- Create incident_reports table for multiple reports of same incident
CREATE TABLE incident_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  reported_by TEXT NOT NULL,
  reported_by_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for incident_reports
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for incident_reports
CREATE POLICY "Anyone can view incident reports" ON incident_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert incident reports" ON incident_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');