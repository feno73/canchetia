import { createSupabaseServer } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createSupabaseServer();
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Check if user profile exists
      const { data: existingUser, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // If user doesn't exist, create profile
      if (userError || !existingUser) {
        const name = data.user.user_metadata.full_name || data.user.email?.split('@')[0] || '';
        const [nombre, ...apellidoParts] = name.split(' ');
        const apellido = apellidoParts.join(' ') || '';

        await supabase.from('usuarios').insert({
          id: data.user.id,
          nombre: nombre || 'Usuario',
          apellido: apellido || '',
          email: data.user.email!,
          telefono: data.user.user_metadata.phone || null,
          rol: 'jugador', // Default role for social auth
        });
      }

      // Check if this is email confirmation
      const type = requestUrl.searchParams.get('type');
      
      if (type === 'signup') {
        // Email verification successful
        return NextResponse.redirect(`${origin}/verify-email?type=signup&access_token=${data.session.access_token}`);
      }
      
      // Regular OAuth login - redirect based on role
      const { data: userData } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', data.user.id)
        .single();

      const redirectPath = userData?.rol === 'admin_complejo' ? '/dashboard' : '/';
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // If there was an error, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=oauth_error`);
}