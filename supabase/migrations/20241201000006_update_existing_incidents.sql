-- Update existing incidents to have default vote values
UPDATE incidents 
SET upvotes = 0, downvotes = 0 
WHERE upvotes IS NULL OR downvotes IS NULL;