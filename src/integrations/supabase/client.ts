// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nsfphygihklucqjiwngl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZnBoeWdpaGtsdWNxaml3bmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzIyNzIsImV4cCI6MjA2MTUwODI3Mn0.Ms15OGYl01a9zK8WuiEOKzUflMipxESJ_u3PI4cFMbc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);