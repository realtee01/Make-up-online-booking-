import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

const customFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const fetchWithTimeout = async (timeoutMs: number) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      return response;
    } finally {
      clearTimeout(id);
    }
  };

  try {
    // Try with a 4 second timeout first (helpful for initial wake-up stalls)
    return await fetchWithTimeout(4000);
  } catch (err: any) {
    if (err.name === 'AbortError') {
      // If it timed out, retry once with a longer timeout
      console.warn('Supabase request timed out, retrying...', url);
      return await fetchWithTimeout(15000);
    }
    throw err;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch
  }
});
