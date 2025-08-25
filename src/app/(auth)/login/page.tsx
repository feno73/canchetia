'use client';

import { useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import SocialAuth from '@/components/auth/SocialAuth';
import { validateLoginForm } from '@/lib/utils/validation';
import { Button, Input } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createSupabaseClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setError(validation.error || 'Datos inválidos');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        // Check user role and redirect accordingly
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user role:', {
            message: userError.message,
            details: userError.details,
            hint: userError.hint,
            code: userError.code
          });
          console.error('User ID being queried:', data.user.id);
          router.push('/dashboard'); // Default redirect
        } else if (!userData) {
          console.error('No user data found for ID:', data.user.id);
          router.push('/dashboard'); // Default redirect
        } else {
          console.log('User role found:', userData.rol);
          const redirectPath = userData.rol === 'admin_complejo' ? '/dashboard' : '/';
          router.push(redirectPath);
        }
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Iniciar Sesión</h2>
        <p className="text-gray-600">Ingresa a tu cuenta para continuar</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Input
          id="email"
          type="email"
          label="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-5 h-5" />}
          placeholder="tu@email.com"
          autoComplete="email"
          required
        />

        <div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-5 h-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        loading={loading}
        fullWidth
        size="lg"
      >
        Iniciar Sesión
      </Button>

      <SocialAuth mode="login" onError={setError} />

      <div className="text-center space-y-2">
        <p className="text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
            Regístrate
          </Link>
        </p>
        <Link
          href="/forgot-password"
          className="text-sm text-gray-500 hover:text-gray-700 block"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </form>
  );
}