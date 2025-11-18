-- Add voting system to incidents
ALTER TABLE incidents ADD COLUMN upvotes INTEGER DEFAULT 0;
ALTER TABLE incidents ADD COLUMN downvotes INTEGER DEFAULT 0;

-- Create incident_votes table
CREATE TABLE incident_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(incident_id, user_email)
);

-- Enable RLS
ALTER TABLE incident_votes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view votes" ON incident_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON incident_votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own votes" ON incident_votes FOR UPDATE USING (auth.email() = user_email);