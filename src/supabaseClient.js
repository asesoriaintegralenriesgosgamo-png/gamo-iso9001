import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'REPLACE_ME'
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'REPLACE_ME'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
