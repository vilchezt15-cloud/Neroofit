import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: Forçando as chaves diretamente pois a Vercel está injetando variáveis antigas de um projeto anterior do Supabase!
const supabaseUrl = 'https://drqsxpvbrrretumjohrc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRycXN4cHZicnJyZXR1bWpvaHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0ODE2MzAsImV4cCI6MjEwMDA1NzYzMH0.nZZVGyJmu8dFNrFP9IVO28n7ZCHMuISn0YnDF5ovSqM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
