'use client';

import { useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { validateEmail } from '@/lib/utils/validation';
import { Button, Input } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const supabase = createSupabaseClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate email
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setError(validation.error || 'Correo inválido');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setEmailSent(true);
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">¡Correo enviado!</h2>
          <p className="text-gray-600">
            Te hemos enviado un enlace para restablecer tu contraseña a <strong>{email}</strong>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">¿No recibiste el correo?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Revisa tu carpeta de spam o correo no deseado</li>
            <li>• Verifica que escribiste correctamente tu correo</li>
            <li>• El enlace expira en 24 horas</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              setEmailSent(false);
              setEmail('');
              setError('');
            }}
            className="text-primary-600 hover:text-primary-700 font-semibold px-4 py-2 rounded-lg border border-primary-300 hover:border-primary-400 transition-colors"
          >
            Intentar con otro correo
          </button>
          <Link
            href="/login"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-center"
          >
            Volver al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">¿Olvidaste tu contraseña?</h2>
        <p className="text-gray-600">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <Input
        id="email"
        type="email"
        label="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail className="w-5 h-5" />}
        placeholder="tu@email.com"
        required
      />

      <Button
        type="submit"
        loading={loading}
        fullWidth
        size="lg"
      >
        Enviar enlace de restablecimiento
      </Button>

      <div className="text-center">
        <Link
          href="/login"
          className="text-gray-600 hover:text-gray-700 font-semibold inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver al login
        </Link>
      </div>
    </form>
  );
}