import { createClient } from "@supabase/supabase-js";

// For server-side code, we can use process.env directly
const supabaseUrl = "https://jolhltwonwkouvpaezxt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvbGhsdHdvbndrb3V2cGFlenh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MjY3NDIsImV4cCI6MjA1MjAwMjc0Mn0.uL065U2m2mtanRHvwIyWdZR036w61W9SdeiZVP6G2Kg";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
