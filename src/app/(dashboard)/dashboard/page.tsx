'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getDashboardMetrics, getRecentReservations } from '@/lib/dashboard/metrics';
import { DashboardStats } from '@/types';
import { Calendar, DollarSign, TrendingUp, MapPin, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createSupabaseClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError('Usuario no autenticado');
          return;
        }

        // Fetch real dashboard metrics
        const metrics = await getDashboardMetrics(user.id);
        const reservations = await getRecentReservations(user.id, 5);
        
        if (metrics) {
          setStats(metrics);
        } else {
          setError('No se pudieron cargar las estadísticas');
        }
        
        setRecentReservations(reservations);
      } catch (err) {
        setError('Error al cargar estadísticas');
        console.error('Stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Resumen de tu actividad y estadísticas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reservas Hoy</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.reservas_hoy || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos Semana</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats?.ingresos_semana?.toLocaleString('es-AR') || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ocupación</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.ocupacion_porcentaje || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Fields */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Canchas Más Reservadas</h2>
        </div>
        <div className="p-6">
          {stats?.canchas_mas_reservadas?.length ? (
            <div className="space-y-4">
              {stats.canchas_mas_reservadas.map((item) => (
                <div key={item.cancha.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 rounded-lg mr-3">
                      <MapPin className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.cancha.nombre}</p>
                      <p className="text-sm text-gray-600">
                        Fútbol {item.cancha.tipo_futbol} - {item.cancha.tipo_superficie}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{item.reservas_count}</p>
                    <p className="text-sm text-gray-600">reservas</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay datos de reservas aún</p>
              <p className="text-sm text-gray-500">
                Crea tu primer complejo para empezar a recibir reservas
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Reservas Recientes</h2>
        </div>
        <div className="p-6">
          {recentReservations?.length ? (
            <div className="space-y-4">
              {recentReservations.map((reservation) => {
                const startDate = new Date(reservation.fecha_hora_inicio);
                const endDate = new Date(reservation.fecha_hora_fin);
                
                return (
                  <div key={reservation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {reservation.usuarios?.nombre} {reservation.usuarios?.apellido}
                        </p>
                        <p className="text-sm text-gray-600">
                          {reservation.canchas?.nombre} - {reservation.canchas?.complejos?.nombre}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {startDate.toLocaleDateString('es-AR')} {startDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ${reservation.precio_total?.toLocaleString('es-AR')}
                      </p>
                      <p className={`text-sm px-2 py-1 rounded-full text-center ${
                        reservation.estado === 'confirmada' 
                          ? 'bg-green-100 text-green-800'
                          : reservation.estado === 'pendiente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {reservation.estado}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay reservas recientes</p>
              <p className="text-sm text-gray-500">
                Las reservas aparecerán aquí una vez que los usuarios empiecen a reservar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h3 className="font-medium text-gray-900">Nuevo Complejo</h3>
              <p className="text-sm text-gray-600 mt-1">Agregar un nuevo complejo deportivo</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h3 className="font-medium text-gray-900">Nueva Cancha</h3>
              <p className="text-sm text-gray-600 mt-1">Añadir cancha a un complejo</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h3 className="font-medium text-gray-900">Ver Reservas</h3>
              <p className="text-sm text-gray-600 mt-1">Gestionar reservas del día</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h3 className="font-medium text-gray-900">Configuración</h3>
              <p className="text-sm text-gray-600 mt-1">Ajustar configuración</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}