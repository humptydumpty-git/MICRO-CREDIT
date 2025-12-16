import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://qfxcmpdclduykznzazqn.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjAwNjVlZGZkLTdmZjMtNGFhMS04ODhhLTI5OTFjMTIzYmFjMCJ9.eyJwcm9qZWN0SWQiOiJxZnhjbXBkY2xkdXlrem56YXpxbiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY1ODQxNTI4LCJleHAiOjIwODEyMDE1MjgsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.zXvZXXTmbWLsShr7JowIz216La1dglNealmrVsRiq0s';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };