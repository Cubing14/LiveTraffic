-- Create functions to handle vote counting
CREATE OR REPLACE FUNCTION increment_upvotes(incident_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE incidents 
  SET upvotes = COALESCE(upvotes, 0) + 1 
  WHERE id = incident_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_downvotes(incident_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE incidents 
  SET downvotes = COALESCE(downvotes, 0) + 1 
  WHERE id = incident_id;
END;
$$ LANGUAGE plpgsql;