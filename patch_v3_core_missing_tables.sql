-- AXIS Schema Patch v3: Core Missing Tables
-- Run this in pgAdmin 4 → axis_db → Query Tool
-- Adds missing core tables that were defined in Sequelize Models but missing from schema

-- 1. Enums
DO $$ BEGIN
    CREATE TYPE "enum_notifications_type" AS ENUM('EVENT_ALERT', 'DEADLINE', 'ANNOUNCEMENT', 'SYSTEM', 'CLUB');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "enum_club_applications_board" AS ENUM('Member Board', 'Assistant Board', 'Main Board', 'Mentor Board');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "enum_club_applications_status" AS ENUM('PENDING', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Tables
CREATE TABLE IF NOT EXISTS "announcements" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "club_id" UUID REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "is_public" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "type" "enum_notifications_type" DEFAULT 'ANNOUNCEMENT',
    "is_read" BOOLEAN DEFAULT FALSE,
    "link" VARCHAR(255),
    "sender_role" VARCHAR(255) DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "club_applications" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "club_id" UUID REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "board" "enum_club_applications_board" NOT NULL,
    "position" VARCHAR(255),
    "status" "enum_club_applications_status" DEFAULT 'PENDING',
    "aptitude_test_date" TIMESTAMP WITH TIME ZONE,
    "interview_date" TIMESTAMP WITH TIME ZONE,
    "admin_notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
