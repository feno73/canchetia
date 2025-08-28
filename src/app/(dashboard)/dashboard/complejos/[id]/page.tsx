'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Complex } from '@/types';
import { ArrowLeft, MapPin, Clock, Phone, FileText, Edit, Plus, Star } from 'lucide-react';
import Link from 'next/link';
import { LinkButton } from '@/components/ui';

export default function ComplejoDetailPage() {
  const params = useParams();
  const [complejo, setComplejo] = useState<Complex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createSupabaseClient();

  const fetchComplejo = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('complejos')
        .select(`
          *,
          canchas(*),
          resenas(
            id,
            calificacion,
            comentario,
            fecha_creacion,
            usuarios(nombre, apellido)
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) {
        setError('Error al cargar el complejo');
        console.error('Error:', error);
        return;
      }

      setComplejo(data);
    } catch (err) {
      setError('Error al cargar el complejo');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id, supabase]);

  useEffect(() => {
    fetchComplejo();
  }, [fetchComplejo, params.id]);

  const calculateAverageRating = (resenas: any[]) => {
    if (!resenas || resenas.length === 0) return 0;
    const total = resenas.reduce((sum, r) => sum + r.calificacion, 0);
    return (total / resenas.length).toFixed(1);
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
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !complejo) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/complejos"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Complejos
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Complejo no encontrado'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/complejos"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Complejos
        </Link>
        <LinkButton
          href={`/dashboard/complejos/${complejo.id}/editar`}
          variant="primary"
          leftIcon={<Edit className="h-4 w-4" />}
        >
          Editar
        </LinkButton>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{complejo.nombre}</h1>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {complejo.direccion}, {complejo.ciudad}
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {complejo.horario_apertura} - {complejo.horario_cierre}
              </div>
              
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {complejo.telefono_contacto}
              </div>
            </div>

            {complejo.descripcion && (
              <div className="flex items-start text-gray-600">
                <FileText className="h-4 w-4 mr-2 mt-0.5" />
                <p>{complejo.descripcion}</p>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="flex items-center mb-2">
              <Star className="h-5 w-5 text-yellow-400 mr-1" />
              <span className="text-lg font-semibold">
                {calculateAverageRating(complejo.resenas || [])}
              </span>
              <span className="text-gray-500 ml-1">
                ({complejo.resenas?.length || 0} reseñas)
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {complejo.canchas?.length || 0} canchas disponibles
            </div>
          </div>
        </div>
      </div>

      {/* Canchas */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Canchas</h2>
          <LinkButton
            href={`/dashboard/canchas/nueva?complejo=${complejo.id}`}
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Nueva Cancha
          </LinkButton>
        </div>
        
        <div className="p-6">
          {complejo.canchas?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complejo.canchas.map((cancha) => (
                <div key={cancha.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{cancha.nombre}</h3>
                    <Link
                      href={`/dashboard/canchas/${cancha.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Ver detalles
                    </Link>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{formatFieldType(cancha.tipo_futbol)}</p>
                    <p>{formatSurfaceType(cancha.tipo_superficie)}</p>
                    <p className={cancha.es_techada ? 'text-green-600' : 'text-gray-500'}>
                      {cancha.es_techada ? 'Techada' : 'Al aire libre'}
                    </p>
                    <p className="font-medium text-gray-900">
                      ${cancha.precio_hora}/hora
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay canchas registradas
              </h3>
              <p className="text-gray-600 mb-4">
                Agrega canchas a tu complejo para empezar a recibir reservas
              </p>
              <LinkButton
                href={`/dashboard/canchas/nueva?complejo=${complejo.id}`}
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Agregar Primera Cancha
              </LinkButton>
            </div>
          )}
        </div>
      </div>

      {/* Reseñas */}
      {complejo.resenas && complejo.resenas.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Reseñas Recientes</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {complejo.resenas.slice(0, 5).map((resena: any) => (
                <div key={resena.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">
                        {resena.usuarios?.nombre} {resena.usuarios?.apellido}
                      </span>
                      <div className="flex items-center ml-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < resena.calificacion ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(resena.fecha_creacion).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  {resena.comentario && (
                    <p className="text-gray-700 text-sm">{resena.comentario}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}