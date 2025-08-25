import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

// Load .env.local explicitly
config({ path: path.join(process.cwd(), '.env.local') });

async function checkRLS() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('🔍 Checking RLS policies...');

    // Check if tables have RLS enabled
    const { data: rls_status } = await supabase.rpc('sql', {
      query: `
        SELECT 
          schemaname, 
          tablename, 
          rowsecurity as rls_enabled,
          (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count
        FROM pg_tables t 
        WHERE schemaname = 'public' 
        AND tablename IN ('usuarios', 'complejos', 'canchas', 'reservas', 'pagos', 'resenas', 'servicios', 'complejo_servicio')
        ORDER BY tablename;
      `
    });

    if (rls_status) {
      console.log('📊 RLS Status for tables:');
      rls_status.forEach((table: any) => {
        console.log(`  ${table.tablename}: RLS ${table.rls_enabled ? '✅' : '❌'}, Policies: ${table.policy_count}`);
      });
    }

    // Check specific policies for usuarios table
    const { data: policies } = await supabase.rpc('sql', {
      query: `
        SELECT 
          policyname, 
          cmd, 
          permissive,
          qual,
          with_check
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'usuarios'
        ORDER BY policyname;
      `
    });

    if (policies) {
      console.log('\n🔒 Policies for usuarios table:');
      policies.forEach((policy: any) => {
        console.log(`  📋 ${policy.policyname} (${policy.cmd})`);
        console.log(`      Permissive: ${policy.permissive}`);
        if (policy.qual) console.log(`      USING: ${policy.qual}`);
        if (policy.with_check) console.log(`      CHECK: ${policy.with_check}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('💥 RLS check failed:', error);
    
    // Try a simpler approach - test direct insert with service role
    console.log('\n🔄 Testing direct insert with service role...');
    try {
      const testData = {
        id: 'test-' + Date.now(),
        nombre: 'Test',
        apellido: 'User',
        email: `test-${Date.now()}@gmail.com`,
        rol: 'jugador' as const,
      };

      const { data, error } = await supabase
        .from('usuarios')
        .insert(testData)
        .select()
        .single();

      if (error) {
        console.error('❌ Service role insert failed:', error);
      } else {
        console.log('✅ Service role insert successful:', data);
        
        // Cleanup
        await supabase.from('usuarios').delete().eq('id', testData.id);
        console.log('🧹 Cleaned up test record');
      }
    } catch (insertError) {
      console.error('💥 Insert test failed:', insertError);
    }
  }
}

checkRLS();