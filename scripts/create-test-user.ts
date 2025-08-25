import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

// Load .env.local explicitly
config({ path: path.join(process.cwd(), '.env.local') });

async function createTestUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  // Use service role key to bypass RLS and email confirmation
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('🔄 Creating test user with confirmed email...');

    // Step 1: Create user in auth.users table with confirmed email
    const testEmail = 'test@canchetia.com';
    const testPassword = 'testpassword123';

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // This confirms the email immediately
    });

    if (authError) {
      console.error('❌ Auth user creation failed:', authError);
      return;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Step 2: Create profile in usuarios table
    const { error: profileError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        nombre: 'Test',
        apellido: 'User',
        email: testEmail,
        rol: 'jugador',
      });

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      // Cleanup auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log('✅ Profile created successfully');

    console.log(`🎉 Test user created successfully!`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   User ID: ${authData.user.id}`);
    console.log('   You can now test login in the app!');

  } catch (error) {
    console.error('💥 Test user creation failed:', error);
  }
}

createTestUser();