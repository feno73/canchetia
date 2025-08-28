import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

// Load .env.local explicitly
config({ path: path.join(process.cwd(), '.env.local') });

async function createTestAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  // Use service role key for admin operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔄 Creating test admin user...');

    const testEmail = 'admin@canchetia.com';
    const testPassword = 'admin123456';

    // First, check if user already exists
    const { data: existingUsers } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', testEmail);

    if (existingUsers && existingUsers.length > 0) {
      console.log('✅ Test admin already exists:', existingUsers[0]);
      return;
    }

    // Create the user with service role (auto-confirmed)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error('❌ Failed to create auth user:', authError);
      return;
    }

    if (!authData.user) {
      console.error('❌ No user returned from auth');
      return;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Create profile in usuarios table
    const { data: profileData, error: profileError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        email: testEmail,
        nombre: 'Administrador',
        apellido: 'Test',
        rol: 'admin_complejo',
        telefono: '+54911234567',
        activo: true,
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Failed to create profile:', profileError);
      return;
    }

    console.log('✅ Profile created:', profileData);

    console.log('\n🎉 Test admin user created successfully!');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    console.log('👤 Role: admin_complejo');
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('💥 Failed to create test admin:', error);
  }
}

createTestAdmin();