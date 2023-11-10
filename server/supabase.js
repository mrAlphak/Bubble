require('dotenv').config()
const { createClient } = require ('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const Supabase = createClient(supabaseUrl, supabaseAnonKey)

module.exports = Supabase