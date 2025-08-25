import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

// Load .env.local explicitly
config({ path: path.join(process.cwd(), '.env.local') });

async function testConfirmedLogin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔄 Testing login with confirmed user...');

    // Use the test user we created
    const testEmail = 'test@canchetia.com';
    const testPassword = 'testpassword123';

    console.log('🔑 Attempting login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (loginError) {
      console.error('❌ Login failed:', loginError);
      return;
    }

    if (!loginData.user) {
      console.error('❌ No user returned from login');
      return;
    }

    console.log('✅ Login successful:', {
      id: loginData.user.id,
      email: loginData.user.email,
      confirmed: loginData.user.email_confirmed_at
    });

    // Test fetching user role (this is where the original error was)
    console.log('🔍 Fetching user role...');
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('rol, nombre, apellido')
      .eq('id', loginData.user.id)
      .single();

    if (userError) {
      console.error('❌ Failed to fetch user role:', {
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
        code: userError.code
      });
      console.error('User ID being queried:', loginData.user.id);
    } else if (!userData) {
      console.error('❌ No user data found for ID:', loginData.user.id);
    } else {
      console.log('✅ User role fetched successfully:', userData);
      const redirectPath = userData.rol === 'admin_complejo' ? '/dashboard' : '/';
      console.log('🎯 Would redirect to:', redirectPath);
    }

    // Sign out for cleanup
    await supabase.auth.signOut();
    console.log('🎉 Login test completed successfully!');

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testConfirmedLogin();