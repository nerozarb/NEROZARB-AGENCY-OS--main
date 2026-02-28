import { supabase } from './supabase';
import { AppData, Client, Task, Post, Protocol, OnboardingProtocol, ActivityEntry, TimelineEvent, OnboardingStep } from './storage';

// Helper to check if Supabase is actually configured
const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return Boolean(url && key && url !== 'https://placeholder-project.supabase.co');
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA MAPPERS: Supabase snake_case → App camelCase
// Supabase / PostgreSQL returns column names in snake_case.
// Our TypeScript models use camelCase. These mappers convert the raw DB rows
// into the correct shape before they touch any React state.
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapClient = (row: any): Client => ({
    id: row.id,
    name: row.name ?? '',
    status: row.status ?? 'Lead',
    revenueGate: row.revenue_gate ?? row.revenueGate ?? '',
    tier: row.tier ?? '',
    ltv: row.ltv ?? 0,
    contractValue: row.contract_value ?? row.contractValue ?? 0,
    phone: row.phone ?? '',
    email: row.email ?? '',
    contactName: row.contact_name ?? row.contactName ?? '',
    niche: row.niche ?? '',
    startDate: row.start_date ?? row.startDate ?? '',
    shadowAvatar: row.shadow_avatar ?? row.shadowAvatar ?? '',
    bleedingNeck: row.bleeding_neck ?? row.bleedingNeck ?? '',
    contentPillars: row.content_pillars ?? row.contentPillars ?? [],
    relationshipHealth: row.relationship_health ?? row.relationshipHealth ?? 'healthy',
    onboardingStatus: row.onboarding_status ?? row.onboardingStatus ?? 'not-started',
    notes: row.notes ?? '',
    timeline: (row.timeline ?? []).map((e: any): TimelineEvent => ({
        id: e.id,
        date: e.date ?? '',
        event: e.event ?? '',
        type: e.type ?? 'system',
    })),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapTask = (row: any): Task => ({
    id: row.id,
    clientId: row.client_id ?? row.clientId,
    name: row.name ?? '',
    category: row.category ?? 'Other',
    phase: row.phase ?? 'phase1',
    stagePipeline: row.stage_pipeline ?? row.stagePipeline ?? ['BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED'],
    currentStage: row.current_stage ?? row.currentStage ?? 'BRIEFED',
    assignedNode: row.assigned_node ?? row.assignedNode ?? 'CEO',
    priority: row.priority ?? 'normal',
    status: row.status ?? 'active',
    deadline: row.deadline ?? '',
    estimatedHours: row.estimated_hours ?? row.estimatedHours ?? null,
    brief: row.brief ?? '',
    assetLinks: row.asset_links ?? row.assetLinks ?? [],
    sopReference: row.sop_reference ?? row.sopReference ?? null,
    activityLog: (row.activity_log ?? row.activityLog ?? []).map((e: any): ActivityEntry => ({
        timestamp: e.timestamp ?? new Date().toISOString(),
        type: e.type ?? 'created',
        from: e.from ?? null,
        to: e.to ?? null,
        text: e.text ?? '',
        author: e.author ?? 'team',
    })),
    notes: row.notes ?? '',
    deliveredOnTime: row.delivered_on_time ?? row.deliveredOnTime ?? null,
    linkedPostId: row.linked_post_id ?? row.linkedPostId ?? null,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapPost = (row: any): Post => ({
    id: row.id,
    clientId: row.client_id ?? row.clientId,
    platforms: row.platforms ?? [],
    postType: row.post_type ?? row.postType ?? 'Static Post',
    contentPillar: row.content_pillar ?? row.contentPillar ?? 'Other',
    templateType: row.template_type ?? row.templateType ?? null,
    hook: row.hook ?? '',
    triggerUsed: row.trigger_used ?? row.triggerUsed ?? null,
    captionBody: row.caption_body ?? row.captionBody ?? '',
    cta: row.cta ?? '',
    ctaType: row.cta_type ?? row.ctaType ?? 'Link in bio',
    hashtags: row.hashtags ?? '',
    visualBrief: row.visual_brief ?? row.visualBrief ?? '',
    scheduledDate: row.scheduled_date ?? row.scheduledDate ?? '',
    scheduledTime: row.scheduled_time ?? row.scheduledTime ?? '10:00',
    publishedDate: row.published_date ?? row.publishedDate ?? null,
    status: row.status ?? 'PLANNED',
    priority: row.priority ?? 'normal',
    assignedTo: row.assigned_to ?? row.assignedTo ?? 'Art Director',
    linkedTaskId: row.linked_task_id ?? row.linkedTaskId ?? null,
    assetLinks: row.asset_links ?? row.assetLinks ?? [],
    referencePost: row.reference_post ?? row.referencePost ?? null,
    performance: row.performance ?? null,
    activityLog: (row.activity_log ?? row.activityLog ?? []).map((e: any): ActivityEntry => ({
        timestamp: e.timestamp ?? new Date().toISOString(),
        type: e.type ?? 'created',
        from: e.from ?? null,
        to: e.to ?? null,
        text: e.text ?? '',
        author: e.author ?? 'team',
    })),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapProtocol = (row: any): Protocol => ({
    id: row.id,
    title: row.title ?? '',
    category: row.category ?? 'sop',
    pillar: row.pillar ?? 'Operations',
    tags: row.tags ?? [],
    status: row.status ?? 'draft',
    content: row.content ?? '',
    promptTool: row.prompt_tool ?? row.promptTool ?? null,
    promptVariables: row.prompt_variables ?? row.promptVariables ?? [],
    usageNotes: row.usage_notes ?? row.usageNotes ?? null,
    exampleOutput: row.example_output ?? row.exampleOutput ?? null,
    linkedTaskTypes: row.linked_task_types ?? row.linkedTaskTypes ?? [],
    linkedClientId: row.linked_client_id ?? row.linkedClientId ?? null,
    relatedProtocolIds: row.related_protocol_ids ?? row.relatedProtocolIds ?? [],
    externalReferences: row.external_references ?? row.externalReferences ?? [],
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString(),
    copyCount: row.copy_count ?? row.copyCount ?? 0,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapOnboarding = (row: any): OnboardingProtocol => ({
    id: row.id ?? '',
    clientId: row.client_id ?? row.clientId,
    steps: (row.steps ?? []).map((s: any): OnboardingStep => ({
        id: s.id ?? '',
        label: s.label ?? '',
        completed: s.completed ?? false,
        owner: s.owner ?? 'Team',
        details: s.details ?? '',
        completedAt: s.completed_at ?? s.completedAt,
    })),
    progress: row.progress ?? 0,
    status: row.status ?? 'on-track',
    lastUpdated: row.last_updated ?? row.lastUpdated ?? new Date().toISOString(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapSettings = (row: any): AppData['settings'] => ({
    ceoPhraseHash: row.ceoPhraseHash ?? row.ceo_phrase_hash ?? null,
    teamPhraseHash: row.teamPhraseHash ?? row.team_phrase_hash ?? null,
    initialized: row.initialized ?? false,
    lastUpdated: row.lastUpdated ?? row.last_updated ?? null,
});

// ─────────────────────────────────────────────────────────────────────────────
// FETCH
// ─────────────────────────────────────────────────────────────────────────────

export const fetchAppDataFromSupabase = async (): Promise<Partial<AppData> | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
        const [clientsRes, tasksRes, postsRes, protocolsRes, onboardingsRes, settingsRes] = await Promise.all([
            supabase.from('clients').select('*'),
            supabase.from('tasks').select('*'),
            supabase.from('posts').select('*'),
            supabase.from('protocols').select('*'),
            supabase.from('onboardings').select('*'),
            supabase.from('settings').select('*').eq('id', 'global').single()
        ]);

        if (clientsRes.error) throw clientsRes.error;
        if (tasksRes.error) throw tasksRes.error;
        if (postsRes.error) throw postsRes.error;
        if (protocolsRes.error) throw protocolsRes.error;
        if (onboardingsRes.error) throw onboardingsRes.error;

        return {
            clients: (clientsRes.data ?? []).map(mapClient),
            tasks: (tasksRes.data ?? []).map(mapTask),
            posts: (postsRes.data ?? []).map(mapPost),
            protocols: (protocolsRes.data ?? []).map(mapProtocol),
            onboardings: (onboardingsRes.data ?? []).map(mapOnboarding),
            settings: settingsRes.data ? mapSettings(settingsRes.data) : undefined,
        };
    } catch (e) {
        console.error('Failed to fetch from Supabase. Falling back to local storage.', e);
        return null;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// SYNC HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const syncClientToSupabase = async (client: Client, isNew: boolean = false) => {
    if (!isSupabaseConfigured()) return;
    try {
        if (isNew) {
            await supabase.from('clients').insert([client]);
        } else {
            await supabase.from('clients').update(client).eq('id', client.id);
        }
    } catch (e) {
        console.error('Failed to sync client to Supabase', e);
    }
};

export const deleteClientFromSupabase = async (id: number) => {
    if (!isSupabaseConfigured()) return;
    try {
        await supabase.from('clients').delete().eq('id', id);
    } catch (e) {
        console.error('Failed to delete client from Supabase', e);
    }
};

export const syncTaskToSupabase = async (task: Task, isNew: boolean = false) => {
    if (!isSupabaseConfigured()) return;
    try {
        if (isNew) {
            await supabase.from('tasks').insert([task]);
        } else {
            await supabase.from('tasks').update(task).eq('id', task.id);
        }
    } catch (e) {
        console.error('Failed to sync task to Supabase', e);
    }
};

export const syncTasksToSupabase = async (tasks: Task[]) => {
    if (!isSupabaseConfigured() || tasks.length === 0) return;
    try {
        await supabase.from('tasks').upsert(tasks);
    } catch (e) {
        console.error('Failed to bulk sync tasks to Supabase', e);
    }
};

export const syncPostToSupabase = async (post: Post, isNew: boolean = false) => {
    if (!isSupabaseConfigured()) return;
    try {
        if (isNew) {
            await supabase.from('posts').insert([post]);
        } else {
            await supabase.from('posts').update(post).eq('id', post.id);
        }
    } catch (e) {
        console.error('Failed to sync post to Supabase', e);
    }
};

export const syncPostsToSupabase = async (posts: Post[]) => {
    if (!isSupabaseConfigured() || posts.length === 0) return;
    try {
        await supabase.from('posts').upsert(posts);
    } catch (e) {
        console.error('Failed to bulk sync posts to Supabase', e);
    }
};

export const syncProtocolToSupabase = async (protocol: Protocol, isNew: boolean = false) => {
    if (!isSupabaseConfigured()) return;
    try {
        if (isNew) {
            await supabase.from('protocols').insert([protocol]);
        } else {
            await supabase.from('protocols').update(protocol).eq('id', protocol.id);
        }
    } catch (e) {
        console.error('Failed to sync protocol to Supabase', e);
    }
};

export const deleteProtocolFromSupabase = async (id: number) => {
    if (!isSupabaseConfigured()) return;
    try {
        await supabase.from('protocols').delete().eq('id', id);
    } catch (e) {
        console.error('Failed to delete protocol from Supabase', e);
    }
};

export const syncOnboardingToSupabase = async (onboarding: OnboardingProtocol, isNew: boolean = false) => {
    if (!isSupabaseConfigured()) return;
    try {
        if (isNew) {
            await supabase.from('onboardings').insert([onboarding]);
        } else {
            await supabase.from('onboardings').update(onboarding).eq('id', onboarding.id);
        }
    } catch (e) {
        console.error('Failed to sync onboarding to Supabase', e);
    }
};

export const syncSettingsToSupabase = async (settings: AppData['settings']) => {
    if (!isSupabaseConfigured()) return;
    try {
        await supabase.from('settings').upsert({
            id: 'global',
            ceoPhraseHash: settings.ceoPhraseHash,
            teamPhraseHash: settings.teamPhraseHash,
            initialized: settings.initialized,
            lastUpdated: settings.lastUpdated
        });
    } catch (e) {
        console.error('Failed to sync settings to Supabase', e);
    }
};
