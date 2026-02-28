-- =====================================================
-- NEROZARB Agency OS — Supabase Database Schema
-- Run this SQL in the Supabase SQL Editor to create
-- all required tables for the Agency OS application.
-- =====================================================

-- Enable Row Level Security (RLS) will be set per table

-- =====================================================
-- 1. CLIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Lead'
        CHECK (status IN ('Lead', 'Discovery', 'Active Sprint', 'Retainer', 'Closed')),
    "revenueGate" TEXT NOT NULL DEFAULT '<1M PKR',
    tier TEXT NOT NULL DEFAULT 'Tier 1: Active Presence',
    ltv NUMERIC NOT NULL DEFAULT 0,
    "contractValue" NUMERIC NOT NULL DEFAULT 0,
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    "contactName" TEXT NOT NULL DEFAULT '',
    niche TEXT NOT NULL DEFAULT '',
    "startDate" TEXT NOT NULL DEFAULT '',
    "shadowAvatar" TEXT NOT NULL DEFAULT '',
    "bleedingNeck" TEXT NOT NULL DEFAULT '',
    "contentPillars" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "relationshipHealth" TEXT NOT NULL DEFAULT 'healthy'
        CHECK ("relationshipHealth" IN ('healthy', 'at-risk', 'critical')),
    "onboardingStatus" TEXT NOT NULL DEFAULT 'not-started'
        CHECK ("onboardingStatus" IN ('not-started', 'in-progress', 'complete')),
    notes TEXT NOT NULL DEFAULT '',
    timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT ''
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Public access policy (adjust for your auth needs)
CREATE POLICY "Allow full access to clients" ON clients
    FOR ALL USING (true) WITH CHECK (true);


-- =====================================================
-- 2. TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    "clientId" BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Other'
        CHECK (category IN ('Content Production', 'Ad Creative', 'Website', 'Strategy',
            'Video Production', 'Brand Design', 'Analytics', 'Automation',
            'Client Communication', 'Other')),
    phase TEXT NOT NULL DEFAULT 'phase1'
        CHECK (phase IN ('phase1', 'phase2', 'phase3', 'ongoing')),
    "stagePipeline" JSONB NOT NULL DEFAULT '["BRIEFED","IN PRODUCTION","REVIEW","CEO APPROVAL","CLIENT APPROVAL","DEPLOYED"]'::jsonb,
    "currentStage" TEXT NOT NULL DEFAULT 'BRIEFED'
        CHECK ("currentStage" IN ('BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED')),
    "assignedNode" TEXT NOT NULL DEFAULT 'CEO'
        CHECK ("assignedNode" IN ('CEO', 'Art Director', 'Video Editor', 'Operations Builder',
            'Social Media Manager', 'Documentation Manager')),
    priority TEXT NOT NULL DEFAULT 'normal'
        CHECK (priority IN ('critical', 'high', 'normal')),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'deployed', 'cancelled')),
    deadline TEXT NOT NULL DEFAULT '',
    "estimatedHours" NUMERIC,
    brief TEXT NOT NULL DEFAULT '',
    "assetLinks" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "sopReference" TEXT,
    "activityLog" JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT NOT NULL DEFAULT '',
    "deliveredOnTime" BOOLEAN,
    "linkedPostId" BIGINT,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT ''
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to tasks" ON tasks
    FOR ALL USING (true) WITH CHECK (true);


-- =====================================================
-- 3. POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    "clientId" BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    platforms JSONB NOT NULL DEFAULT '[]'::jsonb,
    "postType" TEXT NOT NULL DEFAULT 'Static Post'
        CHECK ("postType" IN ('Reel / Short Video', 'Static Post', 'Carousel', 'Story', 'Text Post', 'Event Post')),
    "contentPillar" TEXT NOT NULL DEFAULT '',
    "templateType" TEXT,
    hook TEXT NOT NULL DEFAULT '',
    "triggerUsed" TEXT,
    "captionBody" TEXT NOT NULL DEFAULT '',
    cta TEXT NOT NULL DEFAULT '',
    "ctaType" TEXT NOT NULL DEFAULT 'Comment'
        CHECK ("ctaType" IN ('Comment', 'Link in bio', 'DM for', 'Save this', 'Share this', 'Custom')),
    hashtags TEXT NOT NULL DEFAULT '',
    "visualBrief" TEXT NOT NULL DEFAULT '',
    "scheduledDate" TEXT NOT NULL DEFAULT '',
    "scheduledTime" TEXT NOT NULL DEFAULT '',
    "publishedDate" TEXT,
    status TEXT NOT NULL DEFAULT 'PLANNED'
        CHECK (status IN ('PLANNED', 'BRIEF WRITTEN', 'IN PRODUCTION', 'REVIEW',
            'CEO APPROVAL', 'CLIENT APPROVAL', 'SCHEDULED', 'PUBLISHED')),
    priority TEXT NOT NULL DEFAULT 'normal'
        CHECK (priority IN ('normal', 'high', 'urgent')),
    "assignedTo" TEXT NOT NULL DEFAULT 'Art Director',
    "linkedTaskId" BIGINT,
    "assetLinks" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "referencePost" TEXT,
    performance JSONB,
    "activityLog" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT ''
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to posts" ON posts
    FOR ALL USING (true) WITH CHECK (true);


-- =====================================================
-- 4. PROTOCOLS TABLE (Knowledge Vault)
-- =====================================================
CREATE TABLE IF NOT EXISTS protocols (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'sop'
        CHECK (category IN ('sop', 'ai-prompt', 'client-knowledge-base', 'brand-standard')),
    pillar TEXT NOT NULL DEFAULT 'Operations'
        CHECK (pillar IN ('Market Truth', 'Psychological Warfare', 'Conversion Mechanic',
            'Viral Engine', 'Growth Math', 'Operations', 'Client Management')),
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'draft', 'archived')),
    content TEXT NOT NULL DEFAULT '',
    "promptTool" TEXT
        CHECK ("promptTool" IN ('gemini', 'claude', 'both', NULL)),
    "promptVariables" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "usageNotes" TEXT,
    "exampleOutput" TEXT,
    "linkedTaskTypes" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "linkedClientId" BIGINT,
    "relatedProtocolIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "externalReferences" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',
    "copyCount" INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to protocols" ON protocols
    FOR ALL USING (true) WITH CHECK (true);


-- =====================================================
-- 5. ONBOARDINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS onboardings (
    id TEXT PRIMARY KEY,
    "clientId" BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    progress NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'on-track'
        CHECK (status IN ('on-track', 'blocked', 'completed')),
    "lastUpdated" TEXT NOT NULL DEFAULT ''
);

ALTER TABLE onboardings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to onboardings" ON onboardings
    FOR ALL USING (true) WITH CHECK (true);


-- =====================================================
-- 6. INDEXES for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks("clientId");
CREATE INDEX IF NOT EXISTS idx_posts_client_id ON posts("clientId");
CREATE INDEX IF NOT EXISTS idx_onboardings_client_id ON onboardings("clientId");
CREATE INDEX IF NOT EXISTS idx_protocols_category ON protocols(category);
CREATE INDEX IF NOT EXISTS idx_protocols_pillar ON protocols(pillar);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- =====================================================
-- DONE! All tables created successfully.
-- =====================================================
