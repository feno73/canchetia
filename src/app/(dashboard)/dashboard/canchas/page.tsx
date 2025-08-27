'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { Field } from '@/types';
import { Plus, MapPin, Camera, Edit, Trash2, Eye, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function CanchasPage() {
  const { user } = useAuth();
  const [canchas, setCanchas] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createSupabaseClient();

  const fetchCanchas = useCallback(async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('canchas')
        .select(`
          *,
          complejos!inner(
            id,
            nombre,
            id_usuario_propietario
          )
        `)
        .eq('complejos.id_usuario_propietario', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError('Error al cargar las canchas');
        console.error('Error:', error);
        return;
      }

      setCanchas(data || []);
    } catch (err) {
      setError('Error al cargar las canchas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchCanchas();
  }, [fetchCanchas]);

  const deleteCancha = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cancha?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('canchas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting cancha:', error);
        alert('Error al eliminar la cancha');
        return;
      }

      setCanchas(canchas.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error:', err);
      alert('Error al eliminar la cancha');
    }
  };

  const formatFieldType = (tipo: number) => {
    return `Fútbol ${tipo}`;
  };

  const formatSurfaceType = (superficie: string) => {
    const tipos: { [key: string]: string } = {
      'sintético': 'Césped sintético',
      'natural': 'Césped natural',
      'cemento': 'Cemento'
    };
    return tipos[superficie] || superficie;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Canchas</h1>
          <p className="text-gray-600">Gestiona las canchas de tus complejos</p>
        </div>
        <Link
          href="/dashboard/canchas/nueva"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cancha
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {canchas.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes canchas registradas
          </h3>
          <p className="text-gray-600 mb-6">
            Crea tu primera cancha para empezar a recibir reservas
          </p>
          <Link
            href="/dashboard/canchas/nueva"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Primera Cancha
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canchas.map((cancha) => (
            <div key={cancha.id} className="bg-white rounded-lg shadow overflow-hidden">
              {cancha.fotos && cancha.fotos.length > 0 ? (
                <img
                  src={cancha.fotos[0]}
                  alt={cancha.nombre}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{cancha.nombre}</h3>
                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/canchas/${cancha.id}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/dashboard/canchas/${cancha.id}/editar`}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteCancha(cancha.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {cancha.complejo?.nombre}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {formatFieldType(cancha.tipo_futbol)} - {formatSurfaceType(cancha.tipo_superficie)}
                  </div>
                  
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      cancha.es_techada 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cancha.es_techada ? 'Techada' : 'Al aire libre'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex items-center text-lg font-semibold text-gray-900">
                    <DollarSign className="h-5 w-5 mr-1" />
                    {cancha.precio_hora}/hora
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {cancha.fotos?.length || 0} fotos
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}