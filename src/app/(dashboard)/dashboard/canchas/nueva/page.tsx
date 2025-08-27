'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { ArrowLeft, MapPin, DollarSign, Camera, Upload, X } from 'lucide-react';
import Link from 'next/link';

export default function NuevaCanchaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [complejos, setComplejos] = useState<{id: string, nombre: string}[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const supabase = createSupabaseClient();

  const preselectedComplejo = searchParams.get('complejo');

  const [formData, setFormData] = useState({
    nombre: '',
    id_complejo: preselectedComplejo || '',
    tipo_futbol: 5 as 5 | 7 | 8 | 11,
    tipo_superficie: 'sintético' as 'sintético' | 'natural' | 'cemento',
    es_techada: false,
    precio_hora: '',
  });

  const fetchComplejos = useCallback(async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('complejos')
        .select('id, nombre')
        .eq('id_usuario_propietario', user.id)
        .order('nombre');

      if (error) {
        console.error('Error fetching complexes:', error);
        return;
      }

      setComplejos(data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchComplejos();
  }, [fetchComplejos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images
    const newFiles = [...selectedFiles, ...files].slice(0, 5);
    setSelectedFiles(newFiles);

    // Create preview URLs
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the removed URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of selectedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `canchas/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('fotos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from('fotos')
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      // Upload images first
      const uploadedImageUrls = await uploadImages();

      const { error: insertError } = await supabase
        .from('canchas')
        .insert([
          {
            ...formData,
            precio_hora: parseFloat(formData.precio_hora),
            fotos: uploadedImageUrls,
          }
        ])
        .select()
        .single();

      if (insertError) {
        setError('Error al crear la cancha');
        console.error('Error:', insertError);
        return;
      }

      router.push('/dashboard/canchas');
    } catch (err) {
      setError('Error al crear la cancha');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/canchas"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Canchas
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Cancha</h1>
        <p className="text-gray-600">Crea una nueva cancha en tu complejo deportivo</p>
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
                Nombre de la Cancha *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Cancha Principal"
              />
            </div>

            <div>
              <label htmlFor="id_complejo" className="block text-sm font-medium text-gray-700 mb-2">
                Complejo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="id_complejo"
                  name="id_complejo"
                  required
                  value={formData.id_complejo}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Seleccionar complejo</option>
                  {complejos.map((complejo) => (
                    <option key={complejo.id} value={complejo.id}>
                      {complejo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="tipo_futbol" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Fútbol *
              </label>
              <select
                id="tipo_futbol"
                name="tipo_futbol"
                required
                value={formData.tipo_futbol}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={5}>Fútbol 5</option>
                <option value={7}>Fútbol 7</option>
                <option value={8}>Fútbol 8</option>
                <option value={11}>Fútbol 11</option>
              </select>
            </div>

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
                <option value="sintético">Césped Sintético</option>
                <option value="natural">Césped Natural</option>
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
                  placeholder="0.00"
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
                La cancha está techada
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fotos de la Cancha
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="mb-4">
                  <label
                    htmlFor="images"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Fotos
                  </label>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Sube hasta 5 fotos de la cancha (JPG, PNG)
                </p>
              </div>

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/dashboard/canchas"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Cancha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}