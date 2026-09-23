import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export function createClient(): SupabaseClient {
  if (typeof window !== 'undefined' && (window as any).__supabase_browser_client__) {
    return (window as any).__supabase_browser_client__;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://traqtwdfhxduijhqsuwg.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyYXF0d2RmaHhkdWlqaHFzdXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTg3NDAsImV4cCI6MjA4Mzk3NDc0MH0.XgI_AA8bYrHxxAStgGixo1lUSFqXrLFqWI6aL-GdZxQ';

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  if (typeof window !== 'undefined') {
    (window as any).__supabase_browser_client__ = client;
  }

  return client;
}
