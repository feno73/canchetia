import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

// Load .env.local explicitly
config({ path: path.join(process.cwd(), '.env.local') });

async function testSession() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔄 Testing getSession...');
    console.log('📡 Supabase URL:', supabaseUrl);
    console.log('🔑 Using anon key (first 10 chars):', supabaseKey.substring(0, 10) + '...');

    // Test the problematic call
    const startTime = Date.now();
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    const endTime = Date.now();
    console.log('⏱️  getSession took:', endTime - startTime, 'ms');

    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    } else {
      console.log('✅ Session call successful');
      console.log('👤 Session:', sessionData.session ? 'Found' : 'None');
      if (sessionData.session) {
        console.log('📧 Email:', sessionData.session.user.email);
        console.log('🆔 User ID:', sessionData.session.user.id);
      }
    }

    // Test a simple query
    console.log('🔍 Testing simple query...');
    const { data, error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Query error:', error);
    } else {
      console.log('✅ Query successful, data:', data);
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testSession();