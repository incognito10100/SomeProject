import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This client is used in your React components (browser side)
// It only has permissions that respect Row Level Security rules
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// This client is used in API routes (server side only)
// It bypasses all security rules — use with extreme care
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
