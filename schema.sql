-- AXIS Campus Portal PostgreSQL Schema
-- This schema represents the complete database structure as defined in the Sequelize models.
-- Ensure you run this inside pgAdmin 4 on your target database (e.g., 'axis_db').

-- Enable UUID Extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUM TYPES
-- ==========================================
DO $$ BEGIN
    CREATE TYPE "enum_users_global_role" AS ENUM('SUPER_ADMIN', 'CLUB_ADMIN', 'CLUB_MENTOR', 'STUDENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "enum_users_gender" AS ENUM('Male', 'Female', 'Other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "enum_users_program" AS ENUM('BTECH', 'MTECH');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "enum_users_account_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "enum_clubs_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "enum_club_members_club_role" AS ENUM('CLUB_ADMIN', 'MEMBER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "enum_events_status" AS ENUM('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "enum_mentor_suggestions_category" AS ENUM('GENERAL', 'BUDGET', 'EVENT_PLANNING', 'SAFETY', 'ACADEMIC', 'OUTREACH');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "enum_mentor_suggestions_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "enum_mentor_suggestions_status" AS ENUM('PENDING', 'ACKNOWLEDGED', 'IMPLEMENTED', 'DISMISSED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "enum_budget_items_category" AS ENUM('VENUE', 'CATERING', 'MARKETING', 'PRIZES', 'EQUIPMENT', 'MISCELLANEOUS');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "enum_budget_items_approval_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==========================================
-- 2. TABLES
-- ==========================================

-- ClUBS TABLE
CREATE TABLE IF NOT EXISTS "clubs" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "mission_statement" TEXT,
    "description" TEXT,
    "status" "enum_clubs_status" DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- USERS TABLE
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "username" VARCHAR(255) UNIQUE NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "global_role" "enum_users_global_role" DEFAULT 'STUDENT',
    "assigned_club_id" UUID REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "designation" VARCHAR(255),
    "department" VARCHAR(255),
    "branch" VARCHAR(255),
    "gender" "enum_users_gender",
    "program" "enum_users_program" DEFAULT 'BTECH',
    "admission_year" INTEGER,
    "account_status" "enum_users_account_status" DEFAULT 'PENDING',
    "skills" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CLUB MEMBERS TABLE
CREATE TABLE IF NOT EXISTS "club_members" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "club_id" UUID REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "club_role" "enum_club_members_club_role" DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- EVENTS TABLE
CREATE TABLE IF NOT EXISTS "events" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "club_id" UUID REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP WITH TIME ZONE,
    "end_time" TIMESTAMP WITH TIME ZONE,
    "location" VARCHAR(255),
    "poster_url" VARCHAR(255),
    "max_capacity" INTEGER,
    "price" DECIMAL(10, 2) DEFAULT 0,
    "status" "enum_events_status" DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- EVENT REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS "event_registrations" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "event_id" UUID REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "check_in_status" BOOLEAN DEFAULT FALSE,
    "check_in_time" TIMESTAMP WITH TIME ZONE,
    "is_paid" BOOLEAN DEFAULT FALSE,
    "qr_hash" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- MENTOR SUGGESTIONS TABLE
CREATE TABLE IF NOT EXISTS "mentor_suggestions" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "mentor_id" UUID REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "club_id" UUID REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "event_id" UUID REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "category" "enum_mentor_suggestions_category" DEFAULT 'GENERAL',
    "priority" "enum_mentor_suggestions_priority" DEFAULT 'MEDIUM',
    "status" "enum_mentor_suggestions_status" DEFAULT 'PENDING',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- BUDGET ITEMS TABLE
CREATE TABLE IF NOT EXISTS "budget_items" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "club_id" UUID REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "event_id" UUID REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "description" VARCHAR(255) NOT NULL,
    "category" "enum_budget_items_category" NOT NULL,
    "estimated_amount" DECIMAL(10, 2) NOT NULL,
    "actual_amount" DECIMAL(10, 2),
    "receipt_url" VARCHAR(255),
    "approval_status" "enum_budget_items_approval_status" DEFAULT 'PENDING',
    "mentor_note" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. DEMO SEED DATA (Optional Base Data)
-- ==========================================
-- The passwords here represent bcrypt hashes.
-- For standard passwords like 'admin', 'clublead', etc. 
-- Example bypass hash (password is 'admin'): $2a$08$U3kO4uI5lOSX9dY84z1bUuI678d.0i16.c24AWe5iY5gN8i7yX1.m

-- Feel free to adjust or remove before going to production.
