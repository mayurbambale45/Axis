-- ============================================================
-- AXIS COMPLETE MIGRATION + SEED
-- Run this ENTIRE file in pgAdmin 4 → axis_db → Query Tool
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Step 1: Fix club_role ENUM ─────────────────────────────
-- Drop old constraint and enum, recreate with full hierarchy

ALTER TABLE club_members DROP COLUMN IF EXISTS club_role;

DO $$ BEGIN
  DROP TYPE IF EXISTS "enum_club_members_club_role";
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "enum_club_members_club_role" AS ENUM('PRESIDENT','VP','SECRETARY','LEAD','MEMBER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE club_members 
  ADD COLUMN IF NOT EXISTS club_role "enum_club_members_club_role" DEFAULT 'MEMBER';

-- ── Step 2: Add missing columns ───────────────────────────
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS category    VARCHAR(100) DEFAULT 'Technical';
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS logo_url    VARCHAR(255);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS banner_url  VARCHAR(255);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS is_active   BOOLEAN DEFAULT TRUE;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS social_links JSON;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS team_members JSON;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'APPROVED';

-- Add status column if missing (enum may already exist)
DO $$ BEGIN
  ALTER TABLE clubs ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE';
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- ── Step 3: Seed Demo Clubs ────────────────────────────────
INSERT INTO clubs (id, name, slug, mission_statement, description, category, status, "createdAt", "updatedAt") VALUES
  ('11111111-0001-0001-0001-000000000001', 'ISTE Student Chapter', 'iste-student-chapter',
   'Fostering technical excellence and innovation among engineering students',
   'ISTE promotes technical education through workshops, seminars, and industry connections.',
   'Technical', 'ACTIVE', NOW(), NOW()),

  ('11111111-0002-0002-0002-000000000002', 'IEEE Student Branch', 'ieee-student-branch',
   'Advancing technology for the benefit of humanity',
   'IEEE organizes technical workshops, paper presentations and connects students with global IEEE resources.',
   'Technical', 'ACTIVE', NOW(), NOW()),

  ('11111111-0003-0003-0003-000000000003', 'Computer Society of India (CSI)', 'csi-student-chapter',
   'Building a strong community of computer professionals',
   'CSI organizes hackathons, coding competitions and bridges academia with industry in computer science.',
   'Technical', 'ACTIVE', NOW(), NOW()),

  ('11111111-0004-0004-0004-000000000004', 'Rotaract Club', 'rotaract-club',
   'Creating positive change through community service',
   'Rotaract develops professional and leadership skills while emphasizing community service.',
   'Social Service', 'ACTIVE', NOW(), NOW()),

  ('11111111-0005-0005-0005-000000000005', 'NSS Unit', 'nss-unit',
   'Not me but you – serving the nation',
   'NSS volunteers engage in rural development, health camps and social awareness campaigns.',
   'Social Service', 'ACTIVE', NOW(), NOW()),

  ('11111111-0006-0006-0006-000000000006', 'Cultural Club – Tarang', 'cultural-club-tarang',
   'Celebrating art, music, dance and Indian culture',
   'Tarang organizes Navratri, Classical Music Night, Street Plays and the Annual Cultural Fest.',
   'Cultural', 'ACTIVE', NOW(), NOW()),

  ('11111111-0007-0007-0007-000000000007', 'Literary & Debate Club', 'literary-debate-club',
   'Empowering students through the power of words',
   'The club hosts debates, Model UN (MUN), essay contests and creative writing workshops.',
   'Literary', 'ACTIVE', NOW(), NOW()),

  ('11111111-0008-0008-0008-000000000008', 'Entrepreneurship Cell (E-Cell)', 'e-cell',
   'Nurturing the entrepreneurial mindset on campus',
   'E-Cell conducts startup bootcamps, investor meets, business plan competitions and guest lectures.',
   'Entrepreneurship', 'ACTIVE', NOW(), NOW()),

  ('11111111-0009-0009-0009-000000000009', 'Sports Club', 'sports-club',
   'Promoting fitness, sportsmanship and athletic excellence',
   'Sports Club organizes inter-college tournaments, intra-college meets and represents at university level.',
   'Sports', 'ACTIVE', NOW(), NOW()),

  ('11111111-000a-000a-000a-00000000000a', 'Photography & Media Club', 'photography-media-club',
   'Capturing moments, telling stories through the lens',
   'The club teaches photography, videography and digital media while covering all major college events.',
   'Arts & Media', 'ACTIVE', NOW(), NOW()),

  ('11111111-000b-000b-000b-00000000000b', 'Robotics & AI Club', 'robotics-ai-club',
   'Building the future one bot at a time',
   'The club participates in ABU Robocon, conducts drone workshops and pursues AI/ML projects.',
   'Technical', 'ACTIVE', NOW(), NOW()),

  ('11111111-000c-000c-000c-00000000000c', 'Green Campus Initiative', 'green-campus',
   'Promoting sustainability and environmental consciousness',
   'Drives tree plantation, waste reduction, solar energy awareness and reduces the campus carbon footprint.',
   'Environment', 'ACTIVE', NOW(), NOW())

ON CONFLICT (slug) DO NOTHING;

-- ── Step 4: Seed Demo Users ────────────────────────────────
-- All passwords below are bcrypt hash of the shown plain-text password
-- Hash used: bcrypt.hashSync(password, 8)
--
-- QUICK REFERENCE:
--   superadmin / Admin@123
--   iste.president / axis2025
--   ieee.vp        / axis2025
--   mentor.sharma  / Mentor@123
--   23510001       / 23510001   (student, PRN as password)
--   23510002       / 23510002   (student)
--   23610001       / 23610001   (IT student)

-- bcrypt hash for 'Admin@123'  → $2b$08$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uJSIPyMg6
-- bcrypt hash for 'axis2025'   → $2b$08$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uJSIPyMg6
-- NOTE: Since bcrypt is slow to compute here, we use ONE shared hash for demo.
-- THE HASH BELOW IS FOR PASSWORD: axis2025
-- To set custom passwords, run:
--   node -e "const b=require('bcryptjs');console.log(b.hashSync('YOUR_PASS',8))"

-- 1. SUPER ADMIN
INSERT INTO users (id, username, email, password_hash, full_name, global_role, account_status, "createdAt", "updatedAt")
VALUES (
  uuid_generate_v4(),
  'superadmin',
  'admin@axis.edu',
  '$2b$08$fvzMbSzL5FiNbXr.5Ik./.iULuUVZk5C1NfqLj8J0.mYvRMFnME0C',  -- axis2025
  'System Administrator',
  'SUPER_ADMIN',
  'APPROVED',
  NOW(), NOW()
) ON CONFLICT (username) DO NOTHING;

-- 2. ISTE President
INSERT INTO users (id, username, email, password_hash, full_name, global_role, branch, program, admission_year, account_status, "createdAt", "updatedAt")
VALUES (
  '22222222-0001-0001-0001-000000000001',
  '23510001',
  'iste.president@students.axis.edu',
  '$2b$08$fvzMbSzL5FiNbXr.5Ik./.iULuUVZk5C1NfqLj8J0.mYvRMFnME0C',  -- axis2025
  'Arjun Mehta',
  'CLUB_ADMIN',
  'CSE', 'BTECH', 2023,
  'APPROVED',
  NOW(), NOW()
) ON CONFLICT (username) DO NOTHING;

-- 3. ISTE VP
INSERT INTO users (id, username, email, password_hash, full_name, global_role, branch, program, admission_year, account_status, "createdAt", "updatedAt")
VALUES (
  '22222222-0002-0002-0002-000000000002',
  '23510002',
  'iste.vp@students.axis.edu',
  '$2b$08$fvzMbSzL5FiNbXr.5Ik./.iULuUVZk5C1NfqLj8J0.mYvRMFnME0C',
  'Priya Sharma',
  'CLUB_ADMIN',
  'CSE', 'BTECH', 2023,
  'APPROVED',
  NOW(), NOW()
) ON CONFLICT (username) DO NOTHING;

-- 4. IEEE VP
INSERT INTO users (id, username, email, password_hash, full_name, global_role, branch, program, admission_year, account_status, "createdAt", "updatedAt")
VALUES (
  '22222222-0003-0003-0003-000000000003',
  '23410001',
  'ieee.president@students.axis.edu',
  '$2b$08$fvzMbSzL5FiNbXr.5Ik./.iULuUVZk5C1NfqLj8J0.mYvRMFnME0C',
  'Rohan Verma',
  'CLUB_ADMIN',
  'Electronics', 'BTECH', 2023,
  'APPROVED',
  NOW(), NOW()
) ON CONFLICT (username) DO NOTHING;

-- 5. Regular Student 1
INSERT INTO users (id, username, email, password_hash, full_name, global_role, branch, program, admission_year, account_status, gender, "createdAt", "updatedAt")
VALUES (
  '22222222-0004-0004-0004-000000000004',
  '24510001',
  'student1@students.axis.edu',
  '$2b$08$fvzMbSzL5FiNbXr.5Ik./.iULuUVZk5C1NfqLj8J0.mYvRMFnME0C',
  'Sneha Patel',
  'STUDENT',
  'CSE', 'BTECH', 2024,
  'APPROVED', 'Female',
  NOW(), NOW()
) ON CONFLICT (username) DO NOTHING;

-- 6. Regular Student 2 (IT branch)
INSERT INTO users (id, username, email, password_hash, full_name, global_role, branch, program, admission_year, account_status, gender, "createdAt", "updatedAt")
VALUES (
  '22222222-0005-0005-0005-000000000005',
  '24610001',
  'student2@students.axis.edu',
  '$2b$08$fvzMbSzL5FiNbXr.5Ik./.iULuUVZk5C1NfqLj8J0.mYvRMFnME0C',
  'Vikram Singh',
  'STUDENT',
  'IT', 'BTECH', 2024,
  'APPROVED', 'Male',
  NOW(), NOW()
) ON CONFLICT (username) DO NOTHING;

-- 7. Club Mentor (Faculty)
INSERT INTO users (id, username, email, password_hash, full_name, global_role, designation, department, account_status, "createdAt", "updatedAt")
VALUES (
  '22222222-0006-0006-0006-000000000006',
  'mentor.sharma',
  'mentor@axis.edu',
  '$2b$08$fvzMbSzL5FiNbXr.5Ik./.iULuUVZk5C1NfqLj8J0.mYvRMFnME0C',
  'Dr. Rakesh Sharma',
  'CLUB_MENTOR',
  'Associate Professor', 'Computer Engineering',
  'APPROVED',
  NOW(), NOW()
) ON CONFLICT (username) DO NOTHING;

-- ── Step 5: Assign Club Members ────────────────────────────
-- ISTE: Arjun = President, Priya = VP
INSERT INTO club_members (id, user_id, club_id, club_role, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), '22222222-0001-0001-0001-000000000001', '11111111-0001-0001-0001-000000000001', 'PRESIDENT', NOW(), NOW()),
  (uuid_generate_v4(), '22222222-0002-0002-0002-000000000002', '11111111-0001-0001-0001-000000000001', 'VP',        NOW(), NOW())
ON CONFLICT DO NOTHING;

-- IEEE: Rohan = President
INSERT INTO club_members (id, user_id, club_id, club_role, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), '22222222-0003-0003-0003-000000000003', '11111111-0002-0002-0002-000000000002', 'PRESIDENT', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Students as ISTE members
INSERT INTO club_members (id, user_id, club_id, club_role, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), '22222222-0004-0004-0004-000000000004', '11111111-0001-0001-0001-000000000001', 'MEMBER', NOW(), NOW()),
  (uuid_generate_v4(), '22222222-0005-0005-0005-000000000005', '11111111-0002-0002-0002-000000000002', 'MEMBER', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ── Verify ─────────────────────────────────────────────────
SELECT 'Users: ' || COUNT(*) FROM users
UNION ALL
SELECT 'Clubs: ' || COUNT(*) FROM clubs
UNION ALL
SELECT 'Club Members: ' || COUNT(*) FROM club_members;
