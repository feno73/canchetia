'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { DashboardStats } from '@/types';
import { Calendar, DollarSign, TrendingUp, MapPin } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createSupabaseClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // For now, we'll show placeholder stats
        // In a real implementation, this would fetch from the dashboard_stats view
        setStats({
          reservas_hoy: 5,
          ingresos_semana: 45000,
          ocupacion_porcentaje: 68,
          canchas_mas_reservadas: [
            {
              cancha: {
                id: '1',
                id_complejo: '1',
                nombre: 'Cancha 1 - Fútbol 5',
                tipo_futbol: 5,
                tipo_superficie: 'sintético',
                es_techada: true,
                precio_hora: 8000,
                fotos: [],
                created_at: '',
                updated_at: '',
              },
              reservas_count: 12,
            },
            {
              cancha: {
                id: '2',
                id_complejo: '1',
                nombre: 'Cancha 2 - Fútbol 7',
                tipo_futbol: 7,
                tipo_superficie: 'sintético',
                es_techada: false,
                precio_hora: 12000,
                fotos: [],
                created_at: '',
                updated_at: '',
              },
              reservas_count: 8,
            },
          ],
        });
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