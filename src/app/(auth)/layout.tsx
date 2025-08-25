import { LayoutProps } from '@/types';

export default function AuthLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Canchetia</h1>
          <p className="text-gray-600">Tu plataforma de reservas de fútbol</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">{children}</div>
      </div>
    </div>
  );
}