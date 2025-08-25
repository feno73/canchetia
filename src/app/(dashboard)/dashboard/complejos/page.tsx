'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { Complex } from '@/types';
import { Plus, MapPin, Clock, Phone, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ComplejosPage() {
  const { user } = useAuth();
  const [complejos, setComplejos] = useState<Complex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchComplejos();
  }, []);

  const fetchComplejos = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('complejos')
        .select(`
          *,
          canchas(id, nombre, tipo_futbol),
          resenas(calificacion)
        `)
        .eq('id_usuario_propietario', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError('Error al cargar los complejos');
        console.error('Error:', error);
        return;
      }

      setComplejos(data || []);
    } catch (err) {
      setError('Error al cargar los complejos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteComplejo = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este complejo?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('complejos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting complejo:', error);
        alert('Error al eliminar el complejo');
        return;
      }

      setComplejos(complejos.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error:', err);
      alert('Error al eliminar el complejo');
    }
  };

  const calculateAverageRating = (resenas: any[]) => {
    if (!resenas || resenas.length === 0) return 0;
    const total = resenas.reduce((sum, r) => sum + r.calificacion, 0);
    return (total / resenas.length).toFixed(1);
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
          <h1 className="text-2xl font-bold text-gray-900">Mis Complejos</h1>
          <p className="text-gray-600">Gestiona tus complejos deportivos</p>
        </div>
        <Link
          href="/dashboard/complejos/nuevo"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Complejo
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {complejos.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes complejos registrados
          </h3>
          <p className="text-gray-600 mb-6">
            Crea tu primer complejo deportivo para empezar a recibir reservas
          </p>
          <Link
            href="/dashboard/complejos/nuevo"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Primer Complejo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complejos.map((complejo) => (
            <div key={complejo.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{complejo.nombre}</h3>
                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/complejos/${complejo.id}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/dashboard/complejos/${complejo.id}/editar`}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteComplejo(complejo.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {complejo.direccion}, {complejo.ciudad}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {complejo.horario_apertura} - {complejo.horario_cierre}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {complejo.telefono_contacto}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">
                      {complejo.canchas?.length || 0}
                    </span>
                    <span className="text-gray-600 ml-1">
                      {complejo.canchas?.length === 1 ? 'cancha' : 'canchas'}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">
                      {calculateAverageRating(complejo.resenas || [])}
                    </span>
                    <span className="text-gray-600 ml-1">⭐</span>
                  </div>
                </div>

                {complejo.descripcion && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {complejo.descripcion}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}