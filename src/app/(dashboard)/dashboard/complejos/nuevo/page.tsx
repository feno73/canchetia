'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { ArrowLeft, MapPin, Clock, Phone, FileText } from 'lucide-react';
import Link from 'next/link';

export default function NuevoComplejoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createSupabaseClient();

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    descripcion: '',
    telefono_contacto: '',
    horario_apertura: '08:00',
    horario_cierre: '23:00',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      // Geocode the address (simplified - in production use proper geocoding API)
      const geocodeData = await geocodeAddress();
      
      const { error: insertError } = await supabase
        .from('complejos')
        .insert([
          {
            ...formData,
            id_usuario_propietario: user.id,
            latitud: geocodeData.lat,
            longitud: geocodeData.lng,
          }
        ])
        .select()
        .single();

      if (insertError) {
        setError('Error al crear el complejo');
        console.error('Error:', insertError);
        return;
      }

      router.push('/dashboard/complejos');
    } catch (err) {
      setError('Error al crear el complejo');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Simplified geocoding - in production, use Google Maps API or similar
  const geocodeAddress = async () => {
    // Mock geocoding for now
    return {
      lat: -34.6118, // Buenos Aires default
      lng: -58.3960
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/complejos"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Complejos
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Complejo Deportivo</h1>
        <p className="text-gray-600">Crea un nuevo complejo para gestionar tus canchas</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Complejo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: Complejo La Cancha"
                />
              </div>
            </div>

            <div>
              <label htmlFor="telefono_contacto" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono de Contacto *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="telefono_contacto"
                  name="telefono_contacto"
                  required
                  value={formData.telefono_contacto}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: +54 11 1234-5678"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                required
                value={formData.direccion}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Av. Corrientes 1234"
              />
            </div>

            <div>
              <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad *
              </label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                required
                value={formData.ciudad}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Buenos Aires"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="horario_apertura" className="block text-sm font-medium text-gray-700 mb-2">
                Horario de Apertura *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="time"
                  id="horario_apertura"
                  name="horario_apertura"
                  required
                  value={formData.horario_apertura}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="horario_cierre" className="block text-sm font-medium text-gray-700 mb-2">
                Horario de Cierre *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="time"
                  id="horario_cierre"
                  name="horario_cierre"
                  required
                  value={formData.horario_cierre}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={4}
                value={formData.descripcion}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe las características y servicios de tu complejo..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/dashboard/complejos"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Complejo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}