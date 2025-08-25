'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseClient();

  const email = searchParams.get('email') || '';

  useEffect(() => {
    // Verificar si el usuario llegó aquí después de confirmar el email
    const type = searchParams.get('type');
    const accessToken = searchParams.get('access_token');
    
    if (type === 'signup' && accessToken) {
      setSuccess(true);
      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [searchParams, router]);

  const handleResendEmail = async () => {
    if (!email) {
      setError('No se encontró el correo electrónico');
      return;
    }

    setResendLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setError(error.message);
      } else {
        setError('');
        // Mostrar mensaje de éxito temporal
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMsg.textContent = '¡Correo reenviado exitosamente!';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
          document.body.removeChild(successMsg);
        }, 5000);
      }
    } catch (err) {
      setError('Error al reenviar el correo');
      console.error('Resend email error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">¡Email verificado!</h2>
          <p className="text-gray-600">
            Tu cuenta ha sido verificada exitosamente. Serás redirigido en unos segundos...
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold inline-block"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verifica tu correo electrónico</h2>
        <p className="text-gray-600">
          Te hemos enviado un enlace de verificación a{' '}
          {email && <strong>{email}</strong>}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Instrucciones:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>1. Revisa tu bandeja de entrada</li>
          <li>2. Busca un correo de Canchetia</li>
          <li>3. Haz clic en el enlace de verificación</li>
          <li>4. ¡Listo! Podrás acceder a tu cuenta</li>
        </ul>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-2">¿No recibiste el correo?</h3>
        <ul className="text-sm text-gray-600 space-y-1 mb-3">
          <li>• Revisa tu carpeta de spam o correo no deseado</li>
          <li>• Verifica que escribiste correctamente tu correo</li>
          <li>• Puede tardar algunos minutos en llegar</li>
        </ul>
        
        {email && (
          <Button
            onClick={handleResendEmail}
            loading={resendLoading}
            leftIcon={<Mail className="w-4 h-4" />}
            size="sm"
          >
            Reenviar correo
          </Button>
        )}
      </div>

      <div className="text-center space-y-3">
        <p className="text-sm text-gray-600">
          ¿Ya verificaste tu correo?
        </p>
        <Link
          href="/login"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold inline-block"
        >
          Ir al login
        </Link>
        <div>
          <Link
            href="/register"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Cambiar correo electrónico
          </Link>
        </div>
      </div>
    </div>
  );
}