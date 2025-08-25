import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

// Load .env.local explicitly
config({ path: path.join(process.cwd(), '.env.local') });

async function testLogin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔄 Testing login flow...');

    // Step 1: Create a test user first
    const testEmail = `testlogin${Date.now()}@gmail.com`;
    const testPassword = 'testpassword123';

    console.log('📧 Creating test user for login...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: undefined // Skip email confirmation for testing
      }
    });

    if (signupError) {
      console.error('❌ Signup failed:', signupError);
      return;
    }

    if (!signupData.user) {
      console.error('❌ No user created during signup');
      return;
    }

    console.log('✅ Test user created:', signupData.user.id);

    // Step 2: Create user profile
    const { error: profileError } = await supabase
      .from('usuarios')
      .insert({
        id: signupData.user.id,
        nombre: 'Test',
        apellido: 'Login',
        email: testEmail,
        rol: 'jugador',
      });

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      return;
    }

    console.log('✅ Profile created');

    // Step 3: Sign out and then sign back in
    await supabase.auth.signOut();
    console.log('🔄 Signing out...');

    console.log('🔄 Attempting login...');
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

    console.log('✅ Login successful:', loginData.user.id);

    // Step 4: Test fetching user role (this is where the error happens)
    console.log('🔄 Fetching user role...');
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('rol, nombre, apellido')
      .eq('id', loginData.user.id)
      .single();

    console.log('📊 Query result:');
    console.log('  Data:', userData);
    console.log('  Error:', userError);

    if (userError) {
      console.error('❌ Failed to fetch user role:', userError);
    } else if (!userData) {
      console.error('❌ No user data found');
    } else {
      console.log('✅ User role fetched successfully:', userData);
      const redirectPath = userData.rol === 'admin_complejo' ? '/dashboard' : '/';
      console.log('🎯 Would redirect to:', redirectPath);
    }

    // Cleanup
    console.log('🧹 Cleaning up...');
    await supabase.from('usuarios').delete().eq('id', signupData.user.id);
    console.log('🎉 Login test completed!');

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testLogin();