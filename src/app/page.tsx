'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { Search, MapPin, Calendar, Star, ArrowRight, ChevronDown, LogOut, User } from 'lucide-react';

export default function HomePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/buscar?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/buscar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-argentinian-blue/5 to-cinereous/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-argentinian-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-argentinian-blue/5 to-cinereous/5">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-argentinian-blue">Canchetia</h1>
            </div>
            <nav className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* User Menu Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center text-gray-700 hover:text-argentinian-blue px-3 py-2 rounded-md transition-colors"
                    >
                      <User className="h-5 w-5 mr-2" />
                      ¡Hola, {user.nombre}!
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {userMenuOpen && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setUserMenuOpen(false)}
                        />
                        {/* Menu */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                          <div className="py-1">
                            <Link
                              href="/perfil"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <User className="h-4 w-4 mr-3" />
                              Mi Perfil
                            </Link>
                            <hr className="border-gray-200 my-1" />
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <LogOut className="h-4 w-4 mr-3" />
                              Cerrar Sesión
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {user.rol === 'admin_complejo' ? (
                    <Link
                      href="/dashboard"
                      className="bg-argentinian-blue text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/buscar"
                      className="bg-argentinian-blue text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Buscar Canchas
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-argentinian-blue px-3 py-2 rounded-md transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="bg-argentinian-blue text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Reservá tu cancha de{' '}
            <span className="text-argentinian-blue">fútbol</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            La plataforma más fácil para encontrar y reservar canchas de fútbol en tu ciudad. 
            ¡Organizá tu partido en minutos!
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register?rol=jugador"
                className="bg-argentinian-blue text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center"
              >
                Soy Jugador
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/register?rol=admin_complejo"
                className="bg-cinereous text-white px-8 py-3 rounded-lg hover:bg-secondary-700 transition-colors font-semibold flex items-center justify-center"
              >
                Tengo un Complejo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          )}

          {user?.rol === 'jugador' && (
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Buscar Canchas</h3>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nombre del complejo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-argentinian-blue focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-argentinian-blue text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Buscar Canchas
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-argentinian-blue/10 rounded-lg flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-argentinian-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Búsqueda Fácil</h3>
            <p className="text-gray-600">
              Encontrá canchas cerca tuyo con filtros por ubicación, tipo de cancha y horarios disponibles.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-light-green/20 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-fern-green" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Reserva Instantánea</h3>
            <p className="text-gray-600">
              Reservá tu cancha al instante y pagá de forma segura con Mercado Pago o en el lugar.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-fern-green/20 rounded-lg flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-fern-green" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Mejores Complejos</h3>
            <p className="text-gray-600">
              Accedé a reseñas y calificaciones de otros jugadores para elegir el mejor lugar.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        {!user && (
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <h3 className="text-2xl font-bold mb-4">¿Tenés un complejo deportivo?</h3>
            <p className="text-gray-600 mb-6">
              Uní tu complejo a Canchetia y empezá a recibir reservas online. 
              Gestioná tus canchas, horarios y pagos desde un solo lugar.
            </p>
            <Link
              href="/register?rol=admin_complejo"
              className="bg-cinereous text-white px-8 py-3 rounded-lg hover:bg-secondary-700 transition-colors font-semibold inline-flex items-center"
            >
              Registrar mi Complejo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}