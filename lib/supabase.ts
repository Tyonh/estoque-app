// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// O "!" no final avisa ao TypeScript que nós garantimos que essa variável existe no .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
