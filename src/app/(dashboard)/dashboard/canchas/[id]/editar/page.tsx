'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Field } from '@/types';
import { ArrowLeft, FileText, DollarSign, Users, Clock, Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

type PriceRule = {
  id?: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
  price: number;
  is_active: boolean;
};

export default function EditarCanchaPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supabase = createSupabaseClient();

  const [formData, setFormData] = useState({
    nombre: '',
    tipo_futbol: 5 as 5 | 7 | 8 | 11,
    tipo_superficie: 'sintético' as 'sintético' | 'natural' | 'cemento',
    es_techada: false,
    precio_hora: 0,
  });

  const [cancha, setCancha] = useState<Field | null>(null);
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);

  const daysOfWeek = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' },
  ];

  const fetchCancha = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('canchas')
        .select(`
          *,
          complejos(nombre, horario_apertura, horario_cierre)
        `)
        .eq('id', params.id)
        .single();

      if (error) {
        setError('Error al cargar la cancha');
        console.error('Error:', error);
        return;
      }

      setCancha(data);
      setFormData({
        nombre: data.nombre || '',
        tipo_futbol: data.tipo_futbol || 5,
        tipo_superficie: data.tipo_superficie || 'sintético',
        es_techada: data.es_techada || false,
        precio_hora: data.precio_hora || 0,
      });
    } catch (err) {
      setError('Error al cargar la cancha');
      console.error('Error:', err);
    } finally {
      setFetchLoading(false);
    }
  }, [params.id, supabase]);

  const fetchPriceRules = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('price_rules')
        .select('*')
        .eq('cancha_id', params.id)
        .order('day_of_week')
        .order('start_time');

      if (error) {
        console.error('Error fetching price rules:', error);
        return;
      }

      setPriceRules(data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  }, [params.id, supabase]);

  useEffect(() => {
    fetchCancha();
    fetchPriceRules();
  }, [fetchCancha, fetchPriceRules, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update basic field information
      const { error: updateError } = await supabase
        .from('canchas')
        .update(formData)
        .eq('id', params.id);

      if (updateError) {
        setError('Error al actualizar la cancha');
        console.error('Error:', updateError);
        return;
      }

      // Delete existing price rules
      const { error: deleteError } = await supabase
        .from('price_rules')
        .delete()
        .eq('cancha_id', params.id);

      if (deleteError) {
        throw deleteError;
      }

      // Insert new price rules
      if (priceRules.length > 0) {
        const rulesWithCanchaId = priceRules.map(rule => {
          const { id, ...ruleWithoutId } = rule; // Remove id if it exists
          return {
            ...ruleWithoutId,
            cancha_id: params.id,
          };
        });

        const { error: insertError } = await supabase
          .from('price_rules')
          .insert(rulesWithCanchaId);

        if (insertError) {
          throw insertError;
        }
      }

      setSuccess('Cancha actualizada exitosamente');
      setTimeout(() => {
        router.push(`/dashboard/canchas/${params.id}`);
      }, 1500);
    } catch (err) {
      setError('Error al actualizar la cancha');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'tipo_futbol' ? parseInt(value) :
              name === 'precio_hora' ? parseFloat(value) || 0 :
              value
    });
  };

  const addPriceRule = () => {
    const newRule: PriceRule = {
      day_of_week: 1,
      start_time: '09:00',
      end_time: '18:00',
      price: formData.precio_hora,
      is_active: true,
    };
    setPriceRules([...priceRules, newRule]);
  };

  const updatePriceRule = (index: number, field: keyof PriceRule, value: any) => {
    const updatedRules = [...priceRules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setPriceRules(updatedRules);
  };

  const removePriceRule = (index: number) => {
    setPriceRules(priceRules.filter((_, i) => i !== index));
  };

  if (fetchLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href={`/dashboard/canchas/${params.id}`}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a la Cancha
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Cancha</h1>
        <p className="text-gray-600">Actualiza la información de tu cancha</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Cancha *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: Cancha 1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tipo_futbol" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Fútbol *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="tipo_futbol"
                  name="tipo_futbol"
                  required
                  value={formData.tipo_futbol}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={5}>Fútbol 5</option>
                  <option value={7}>Fútbol 7</option>
                  <option value={8}>Fútbol 8</option>
                  <option value={11}>Fútbol 11</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tipo_superficie" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Superficie *
              </label>
              <select
                id="tipo_superficie"
                name="tipo_superficie"
                required
                value={formData.tipo_superficie}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="sintético">Césped sintético</option>
                <option value="natural">Césped natural</option>
                <option value="cemento">Cemento</option>
              </select>
            </div>

            <div>
              <label htmlFor="precio_hora" className="block text-sm font-medium text-gray-700 mb-2">
                Precio por Hora *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="precio_hora"
                  name="precio_hora"
                  required
                  min="0"
                  step="0.01"
                  value={formData.precio_hora}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: 8000"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <input
                id="es_techada"
                name="es_techada"
                type="checkbox"
                checked={formData.es_techada}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="es_techada" className="ml-2 block text-sm text-gray-700">
                Cancha techada
              </label>
            </div>
          </div>

        </form>
      </div>

      {/* Price Configuration Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Configuración de Precios</h2>
          
          {/* Price Rules */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium text-gray-900">Precios Especiales</h3>
              <Button
                type="button"
                onClick={addPriceRule}
                variant="primary"
                size="sm"
              >
                Agregar Regla
              </Button>
            </div>

            {priceRules.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No hay reglas de precio configuradas</p>
                <p className="text-sm text-gray-500">
                  Agrega reglas para configurar precios especiales por día y horario
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {priceRules.map((rule, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Día
                        </label>
                        <select
                          value={rule.day_of_week}
                          onChange={(e) => updatePriceRule(index, 'day_of_week', parseInt(e.target.value))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                          {daysOfWeek.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Desde
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="time"
                            value={rule.start_time}
                            onChange={(e) => updatePriceRule(index, 'start_time', e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hasta
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="time"
                            value={rule.end_time}
                            onChange={(e) => updatePriceRule(index, 'end_time', e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={rule.price}
                            onChange={(e) => updatePriceRule(index, 'price', parseFloat(e.target.value) || 0)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <input
                            id={`active-${index}`}
                            type="checkbox"
                            checked={rule.is_active}
                            onChange={(e) => updatePriceRule(index, 'is_active', e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`active-${index}`} className="ml-2 block text-sm text-gray-700">
                            Activa
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePriceRule(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Operation Hours Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Horarios de Operación del Complejo
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    {cancha?.complejos?.nombre}: {cancha?.complejos?.horario_apertura} - {cancha?.complejos?.horario_cierre}
                  </p>
                  <p className="mt-1">
                    Las reglas de precio solo se aplicarán dentro de estos horarios.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Section */}
      <div className="flex justify-end space-x-4 pt-6">
        <Link
          href={`/dashboard/canchas/${params.id}`}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancelar
        </Link>
        <Button
          onClick={handleSubmit}
          loading={loading}
          variant="primary"
          leftIcon={<Save className="h-4 w-4" />}
        >
          Guardar Todos los Cambios
        </Button>
      </div>
    </div>
  );
}