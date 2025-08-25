'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Field } from '@/types';
import { ArrowLeft, MapPin, DollarSign, Camera, Edit, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CanchaDetailPage() {
  const params = useParams();
  const [cancha, setCancha] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchCancha();
  }, [params.id]);

  const fetchCancha = async () => {
    try {
      const { data, error } = await supabase
        .from('canchas')
        .select(`
          *,
          complejos(
            id,
            nombre,
            direccion,
            ciudad,
            telefono_contacto,
            horario_apertura,
            horario_cierre
          ),
          reservas(
            id,
            fecha_hora_inicio,
            fecha_hora_fin,
            estado,
            usuarios(nombre, apellido)
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) {
        setError('Error al cargar la cancha');
        console.error('Error:', error);
        return;
      }

      setCancha(data);
    } catch (err) {
      setError('Error al cargar la cancha');
      console.error('Error:', err);
    } finally {
      setLoading(false);
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

  const nextImage = () => {
    if (cancha?.fotos && cancha.fotos.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === cancha.fotos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (cancha?.fotos && cancha.fotos.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? cancha.fotos.length - 1 : prev - 1
      );
    }
  };

  const getRecentReservations = () => {
    if (!cancha?.reservas) return [];
    return cancha.reservas
      .filter((r: any) => r.estado === 'confirmada')
      .sort((a: any, b: any) => new Date(b.fecha_hora_inicio).getTime() - new Date(a.fecha_hora_inicio).getTime())
      .slice(0, 5);
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

  if (error || !cancha) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/canchas"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Canchas
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Cancha no encontrada'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/canchas"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Canchas
        </Link>
        <Link
          href={`/dashboard/canchas/${cancha.id}/editar`}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Image Gallery */}
        {cancha.fotos && cancha.fotos.length > 0 ? (
          <div className="relative">
            <img
              src={cancha.fotos[currentImageIndex]}
              alt={cancha.nombre}
              className="w-full h-64 sm:h-80 object-cover"
            />
            
            {cancha.fotos.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  ›
                </button>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {cancha.fotos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-64 sm:h-80 bg-gray-100 flex items-center justify-center">
            <Camera className="h-16 w-16 text-gray-400" />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{cancha.nombre}</h1>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {cancha.complejo?.nombre}
                </div>
                
                <div className="text-gray-600">
                  {cancha.complejo?.direccion}, {cancha.complejo?.ciudad}
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    {formatFieldType(cancha.tipo_futbol)}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm font-medium text-gray-700">
                    {formatSurfaceType(cancha.tipo_superficie)}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    cancha.es_techada 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {cancha.es_techada ? 'Techada' : 'Al aire libre'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center text-2xl font-bold text-gray-900 mb-2">
                <DollarSign className="h-6 w-6" />
                {cancha.precio_hora}/hora
              </div>
              <div className="text-sm text-gray-600">
                {cancha.fotos?.length || 0} fotos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complex Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Complejo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              Horarios: {cancha.complejo?.horario_apertura} - {cancha.complejo?.horario_cierre}
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {cancha.complejo?.telefono_contacto}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Reservas Recientes</h2>
        </div>
        
        <div className="p-6">
          {getRecentReservations().length > 0 ? (
            <div className="space-y-4">
              {getRecentReservations().map((reserva: any) => {
                const startDate = new Date(reserva.fecha_hora_inicio);
                const endDate = new Date(reserva.fecha_hora_fin);
                
                return (
                  <div key={reserva.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {reserva.usuarios?.nombre} {reserva.usuarios?.apellido}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {startDate.toLocaleDateString('es-AR')} {startDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      {reserva.estado}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay reservas recientes</p>
              <p className="text-sm text-gray-500">
                Las reservas aparecerán aquí una vez que los usuarios empiecen a reservar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}