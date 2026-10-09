-- AXIS Schema Patch v2
-- Run this in pgAdmin 4 → axis_db → Query Tool
-- Adds new columns only if they don't already exist

-- section field for students
ALTER TABLE users ADD COLUMN IF NOT EXISTS section VARCHAR(10);

-- phone number for all users
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

-- professional bio
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- mentor_club_ids: JSON array of up to 2 club UUIDs (used for CLUB_MENTOR)
ALTER TABLE users ADD COLUMN IF NOT EXISTS mentor_club_ids JSON DEFAULT '[]';

-- Confirm
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
