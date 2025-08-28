import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

// Load .env.local explicitly
config({ path: path.join(process.cwd(), '.env.local') });

async function resetAdminPassword() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  // Use service role key for admin operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔄 Resetting admin password...');

    const testEmail = 'admin@canchetia.com';
    const newPassword = 'admin123456';

    // Get the user ID first
    const { data: userData } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', testEmail)
      .single();

    if (!userData) {
      console.error('❌ Admin user not found in database');
      return;
    }

    console.log('✅ Found admin user:', userData.id);

    // Update the password using admin API
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      userData.id,
      { 
        password: newPassword,
        email_confirm: true
      }
    );

    if (updateError) {
      console.error('❌ Failed to update password:', updateError);
      return;
    }

    console.log('✅ Password updated successfully');

    // Test the login
    console.log('🔍 Testing login...');
    
    // Create a regular client for testing
    const testClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    
    const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
      email: testEmail,
      password: newPassword,
    });

    if (loginError) {
      console.error('❌ Login test failed:', loginError);
    } else {
      console.log('✅ Login test successful!');
      console.log('👤 User:', loginData.user?.email);
      
      // Clean up - sign out
      await testClient.auth.signOut();
    }

    console.log('\n🎉 Admin password reset complete!');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', newPassword);

  } catch (error) {
    console.error('💥 Failed to reset password:', error);
  }
}

resetAdminPassword();