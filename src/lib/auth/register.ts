import { createSupabaseClient } from '@/lib/supabase/client';
import { UserRole } from '@/types';

interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  rol: UserRole;
}

export async function registerUser(data: RegisterData) {
  const supabase = createSupabaseClient();

  try {
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: `${data.nombre} ${data.apellido}`,
          rol: data.rol,
        },
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return { 
        success: false, 
        error: authError.message,
        step: 'auth' 
      };
    }

    if (!authData.user) {
      return { 
        success: false, 
        error: 'No se pudo crear el usuario',
        step: 'auth' 
      };
    }

    // Step 2: Create user profile - wait a bit for auth to propagate
    await new Promise(resolve => setTimeout(resolve, 100));

    const { data: profileData, error: profileError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono || null,
        rol: data.rol,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', {
        error: profileError,
        user_id: authData.user.id,
        data: {
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          rol: data.rol,
        }
      });

      // Try to clean up the auth user if profile creation failed
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('Error during cleanup:', signOutError);
      }

      return { 
        success: false, 
        error: `Error al crear el perfil: ${profileError.message}`,
        step: 'profile',
        details: profileError
      };
    }

    return { 
      success: true, 
      user: authData.user,
      profile: profileData,
      step: 'completed'
    };

  } catch (error) {
    console.error('Unexpected registration error:', error);
    return { 
      success: false, 
      error: 'Error inesperado durante el registro',
      step: 'unknown',
      details: error
    };
  }
}