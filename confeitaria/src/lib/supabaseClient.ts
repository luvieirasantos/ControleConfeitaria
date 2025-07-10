import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://normftiwibhlgxvtyers.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vcm1mdGl3aWJobGd4dnR5ZXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjkzMTEsImV4cCI6MjA2Nzc0NTMxMX0.MkELKsX85GtC6uK65vTiU9vA-mzTYWs7mZWad_ngST0';

export const supabase = createClient(supabaseUrl, supabaseKey);