import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_REACT_APP_SUPABASE_URL ||
  "";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_REACT_APP_SUPABASE_ANON_KEY ||
  "";

if (!supabaseUrl) {
  throw new Error("Supabase URL is not defined. Check your environment variables.");
}

if (!supabaseAnonKey) {
  throw new Error(
    "Supabase anon key is not defined. Check your environment variables."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};

export default supabase;
