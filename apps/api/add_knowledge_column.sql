-- Add knowledge column to question_groups table
ALTER TABLE question_groups ADD COLUMN IF NOT EXISTS knowledge TEXT;
