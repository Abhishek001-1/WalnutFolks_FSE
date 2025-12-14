import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =  "https://qjzavtxdrvmtafcolaqs.supabase.co"
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqemF2dHhkcnZtdGFmY29sYXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MDcxMzgsImV4cCI6MjA4MTI4MzEzOH0.zmy7HMi1Rqxru1Iqh0SN7pEikFrMYEDF8HX6sLYrd5M"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
