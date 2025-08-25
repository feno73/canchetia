import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

// Load .env.local explicitly
config({ path: path.join(process.cwd(), '.env.local') });

async function testConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing environment variables');
      console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
      console.log('SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection
    const { data, error } = await supabase.from('usuarios').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Table query failed:', error.message);
      console.log('💡 This likely means the usuarios table does not exist yet.');
      console.log('📝 You need to apply the database migrations first.');
      return;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('✅ usuarios table exists');
    console.log('📊 Database is ready!');
    
  } catch (error) {
    console.error('💥 Connection test failed:', error);
  }
}

testConnection();