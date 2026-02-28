import { supabase } from './supabase';
import { AppData, Client, Task, Post, Protocol, OnboardingProtocol, INITIAL_DATA } from './storage';

// Helper to check if Supabase is actually configured
const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return Boolean(url && key && url !== 'https://placeholder-project.supabase.co');
};

export const fetchAppDataFromSupabase = async (): Promise<Partial<AppData> | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
        const [clientsRes, tasksRes, postsRes, protocolsRes, onboardingsRes] = await Promise.all([
            supabase.from('clients').select('*'),
            supabase.from('tasks').select('*'),
            supabase.from('posts').select('*'),
            supabase.from('protocols').select('*'),
            supabase.from('onboardings').select('*')
        ]);

        if (clientsRes.error) throw clientsRes.error;
        if (tasksRes.error) throw tasksRes.error;
        if (postsRes.error) throw postsRes.error;
        if (protocolsRes.error) throw protocolsRes.error;
        if (onboardingsRes.error) throw onboardingsRes.error;

        return {
            clients: clientsRes.data as Client[],
            tasks: tasksRes.data as Task[],
            posts: postsRes.data as Post[],
            protocols: protocolsRes.data as Protocol[],
            onboardings: onboardingsRes.data as OnboardingProtocol[]
        };
    } catch (e) {
        console.error('Failed to fetch from Supabase. Falling back to local storage.', e);
        return null;
    }
};

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
