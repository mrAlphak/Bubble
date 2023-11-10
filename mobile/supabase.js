import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ifudhuwaomfquueccsck.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdWRodXdhb21mcXV1ZWNjc2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTYwNzg4ODcsImV4cCI6MjAxMTY1NDg4N30.hIHxni09YyDsjkOptfp7qdW6h1OIQ_yAQjIqnEzw6PI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})