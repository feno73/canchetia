import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

// Load .env.local explicitly
config({ path: path.join(process.cwd(), '.env.local') });

async function testDirectInsert() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role key for admin access
  
  console.log('Service key available:', !!supabaseKey);
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('🔄 Testing direct insert with service role...');

    // Test direct insert to usuarios table
    const testData = {
      id: '00000000-0000-0000-0000-000000000001', // Fixed UUID for testing
      nombre: 'Test',
      apellido: 'User', 
      email: `test${Date.now()}@gmail.com`,
      rol: 'jugador' as const,
    };

    console.log('📝 Attempting insert...');
    const { data: insertData, error: insertError } = await supabase
      .from('usuarios')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      return;
    }

    console.log('✅ Insert successful:', insertData);

    // Clean up
    console.log('🧹 Cleaning up...');
    const { error: deleteError } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', testData.id);

    if (deleteError) {
      console.error('⚠️  Cleanup failed:', deleteError);
    } else {
      console.log('✅ Cleanup successful');
    }

    // Test with anon key (what the app uses)
    console.log('\n🔄 Testing with anon key (app perspective)...');
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const testAnonData = {
      id: '00000000-0000-0000-0000-000000000002',
      nombre: 'Anon',
      apellido: 'Test',
      email: `anontest${Date.now()}@gmail.com`,
      rol: 'jugador' as const,
    };

    console.log('📝 Attempting anon insert...');
    const { data: anonInsertData, error: anonInsertError } = await anonSupabase
      .from('usuarios')
      .insert(testAnonData)
      .select()
      .single();

    if (anonInsertError) {
      console.error('❌ Anon insert failed:', anonInsertError);
    } else {
      console.log('✅ Anon insert successful:', anonInsertData);
      
      // Cleanup anon test data
      await supabase.from('usuarios').delete().eq('id', testAnonData.id);
    }

    console.log('🎉 Direct insert test completed!');

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testDirectInsert();