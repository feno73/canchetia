import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

// Load .env.local explicitly
config({ path: path.join(process.cwd(), '.env.local') });

async function testUserRegistration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔄 Testing user registration flow...');

    // Step 1: Test if we can create a test user
    const testEmail = `test${Date.now()}@gmail.com`;
    const testPassword = 'testpassword123';

    console.log('📧 Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.error('❌ Auth signup failed:', authError.message);
      return;
    }

    if (!authData.user) {
      console.error('❌ No user created');
      return;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Step 2: Test profile creation
    console.log('👤 Creating user profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        nombre: 'Test',
        apellido: 'User',
        email: testEmail,
        rol: 'jugador',
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      console.log('🔍 Error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
      });
      
      // Clean up auth user
      await supabase.auth.signOut();
      return;
    }

    console.log('✅ Profile created successfully:', profileData);

    // Clean up - delete test user
    console.log('🧹 Cleaning up...');
    await supabase.from('usuarios').delete().eq('id', authData.user.id);
    await supabase.auth.signOut();
    
    console.log('🎉 Registration flow test completed successfully!');

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testUserRegistration();