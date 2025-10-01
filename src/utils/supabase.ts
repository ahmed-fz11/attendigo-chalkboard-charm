import { createClient } from '@supabase/supabase-js';

// Using your external Supabase project
const supabaseUrl = 'https://izojvjihlozhnbgoumcb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b2p2amlobG96aG5iZ291bWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NzM2NzcsImV4cCI6MjA3MzU0OTY3N30.HAag54UmBSeoAkk1a3LDZ1sVym5osKKw4EHLA-9vPvs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper to get current access token for future n8n API calls
export const getAccessToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

// Helper for future n8n API calls with auto-attached Authorization header
export const createAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = await getAccessToken();
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};
