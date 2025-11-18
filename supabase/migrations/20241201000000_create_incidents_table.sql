-- Create incidents table
CREATE TABLE incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('choque', 'obra', 'cierre', 'congestion', 'otro')),
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  impact VARCHAR(10) NOT NULL CHECK (impact IN ('bajo', 'medio', 'alto')),
  description TEXT,
  status VARCHAR(10) DEFAULT 'activo' CHECK (status IN ('activo', 'resuelto')),
  reports INTEGER DEFAULT 1,
  reported_by TEXT NOT NULL,
  reported_by_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view incidents" ON incidents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert incidents" ON incidents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own incidents" ON incidents FOR UPDATE USING (auth.email() = reported_by_email);

-- Create index for better performance
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX idx_incidents_location ON incidents USING GIST (point(longitude, latitude));