'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Field } from '@/types';
import { ArrowLeft, Clock, DollarSign, Save } from 'lucide-react';
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

export default function CanchaConfiguracionPage() {
  const params = useParams();
  const [cancha, setCancha] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supabase = createSupabaseClient();

  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [defaultPrice, setDefaultPrice] = useState<number>(0);

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
      setDefaultPrice(data.precio_hora);
    } catch (err) {
      setError('Error al cargar la cancha');
      console.error('Error:', err);
    } finally {
      setLoading(false);
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

  const addPriceRule = () => {
    const newRule: PriceRule = {
      day_of_week: 1,
      start_time: '09:00',
      end_time: '18:00',
      price: defaultPrice,
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

  const savePriceConfiguration = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update default price
      const { error: updateError } = await supabase
        .from('canchas')
        .update({ precio_hora: defaultPrice })
        .eq('id', params.id);

      if (updateError) {
        throw updateError;
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
        const rulesWithCanchaId = priceRules.map(rule => ({
          ...rule,
          cancha_id: params.id,
        }));

        const { error: insertError } = await supabase
          .from('price_rules')
          .insert(rulesWithCanchaId);

        if (insertError) {
          throw insertError;
        }
      }

      setSuccess('Configuración guardada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al guardar la configuración');
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !cancha) {
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
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/canchas/${params.id}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a {cancha?.nombre}
        </Link>
        <Button
          onClick={savePriceConfiguration}
          loading={saving}
          variant="primary"
          leftIcon={<Save className="h-4 w-4" />}
        >
          Guardar Configuración
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración de Precios</h1>
        <p className="text-gray-600">Configura precios especiales por día y horario para {cancha?.nombre}</p>
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

      {/* Default Price */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Precio Base</h2>
        <div className="max-w-xs">
          <label htmlFor="defaultPrice" className="block text-sm font-medium text-gray-700 mb-2">
            Precio por hora por defecto
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              id="defaultPrice"
              min="0"
              step="0.01"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Este precio se aplicará cuando no haya reglas específicas
          </p>
        </div>
      </div>

      {/* Price Rules */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Precios Especiales</h2>
          <Button
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
                {cancha?.complejo?.nombre}: {cancha?.complejo?.horario_apertura} - {cancha?.complejo?.horario_cierre}
              </p>
              <p className="mt-1">
                Las reglas de precio solo se aplicarán dentro de estos horarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}