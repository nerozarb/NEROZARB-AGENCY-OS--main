-- NEROZARB Agency OS - Supabase Database Initialization
-- Run this script in the Supabase SQL Editor to create your tables.

-- 1. Clients Table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    revenueGate TEXT,
    tier TEXT,
    ltv NUMERIC DEFAULT 0,
    contractValue NUMERIC DEFAULT 0,
    phone TEXT,
    email TEXT,
    contactName TEXT,
    niche TEXT,
    startDate DATE,
    shadowAvatar TEXT,
    bleedingNeck TEXT,
    contentPillars TEXT[], -- Array of strings
    relationshipHealth TEXT,
    onboardingStatus TEXT,
    notes TEXT,
    timeline JSONB, -- Stored as JSON
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tasks Table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    clientId INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    phase TEXT,
    stagePipeline TEXT[],
    currentStage TEXT,
    assignedNode TEXT,
    priority TEXT,
    status TEXT,
    deadline DATE,
    estimatedHours NUMERIC,
    brief TEXT,
    assetLinks TEXT[],
    sopReference TEXT,
    activityLog JSONB,
    notes TEXT,
    deliveredOnTime BOOLEAN,
    linkedPostId INTEGER,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Posts Table
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    clientId INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    platforms TEXT[],
    postType TEXT,
    contentPillar TEXT,
    templateType TEXT,
    hook TEXT,
    triggerUsed TEXT,
    captionBody TEXT,
    cta TEXT,
    ctaType TEXT,
    hashtags TEXT,
    visualBrief TEXT,
    scheduledDate DATE,
    scheduledTime TEXT,
    publishedDate DATE,
    status TEXT,
    priority TEXT,
    assignedTo TEXT,
    linkedTaskId INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    assetLinks TEXT[],
    referencePost TEXT,
    performance JSONB,
    activityLog JSONB,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Protocols Table (Knowledge Vault)
CREATE TABLE protocols (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    pillar TEXT,
    tags TEXT[],
    status TEXT,
    content TEXT,
    promptTool TEXT,
    promptVariables TEXT[],
    usageNotes TEXT,
    exampleOutput TEXT,
    linkedTaskTypes TEXT[],
    linkedClientId INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    relatedProtocolIds INTEGER[],
    externalReferences TEXT[],
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    copyCount INTEGER DEFAULT 0
);

-- 5. Onboardings Table
CREATE TABLE onboardings (
    id TEXT PRIMARY KEY,
    clientId INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    steps JSONB,
    progress INTEGER DEFAULT 0,
    status TEXT,
    lastUpdated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Realtime for all tables
alter publication supabase_realtime add table clients;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table protocols;
alter publication supabase_realtime add table onboardings;

-- Setup Row Level Security (RLS) - For now, allow authenticated users full access
-- (You can tighten this later depending on your auth strategy)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboardings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated users full access to clients" ON clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to tasks" ON tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to posts" ON posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to protocols" ON protocols FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated users full access to onboardings" ON onboardings FOR ALL USING (auth.role() = 'authenticated');

-- Note: To permit insert/update/delete for completely anonymous users (if you aren't using Supabase Auth yet), 
-- you can change `auth.role() = 'authenticated'` to `true`.
