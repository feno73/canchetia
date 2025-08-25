import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

// Load .env.local explicitly
config({ path: path.join(process.cwd(), '.env.local') });

async function debugAuthHook() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔄 Debugging auth hook behavior...');

    // Step 1: Check current session (what useAuth does first)
    console.log('1. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return;
    }

    console.log('Session result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      userId: session?.user?.id
    });

    if (!session?.user) {
      console.log('✅ No session - hook should set loading: false, user: null');
      return;
    }

    // Step 2: Try to fetch user profile (what causes the hang)
    console.log('\n2. Fetching user profile from database...');
    console.log('Querying for user ID:', session.user.id);

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', session.user.id)
      .single();

    console.log('Profile query result:', {
      hasData: !!userData,
      hasError: !!userError,
      error: userError,
      data: userData
    });

    if (userError) {
      console.error('❌ Profile fetch failed:', {
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
        code: userError.code
      });
      console.log('Hook should set: loading: false, user: null, error: message');
    } else if (userData) {
      console.log('✅ Profile fetched successfully');
      console.log('Hook should set: loading: false, user: userData, error: null');
    } else {
      console.log('⚠️ No profile data returned');
      console.log('Hook should set: loading: false, user: null');
    }

    // Step 3: Test the auth state change listener
    console.log('\n3. Testing auth state...');
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current auth user:', {
      id: user?.id,
      email: user?.email,
      confirmed: user?.email_confirmed_at
    });

  } catch (error) {
    console.error('💥 Debug failed:', error);
  }
}

debugAuthHook();