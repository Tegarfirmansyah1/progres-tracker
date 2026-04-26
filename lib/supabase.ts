// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Gunakan "!" di akhir untuk memberi tahu TypeScript bahwa variabel ini pasti ada
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);