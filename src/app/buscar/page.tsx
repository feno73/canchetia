'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  Home,
  Sliders,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { useSearchFilters, useTimeSlots } from '@/lib/hooks/useSearchFilters';
import { searchComplexes, SearchResult } from '@/lib/search/searchService';
import { ComplexCardGrid } from '@/components/search/ComplexCard';
import { Button } from '@/components/ui';

// Componente principal envuelto en Suspense
export default function BuscarPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <BuscarPageContent />
    </Suspense>
  );
}

function BuscarPageContent() {
  const {
    filters,
    debouncedNombreComplejo,
    isLoading,
    setIsLoading,
    updateFilter,
    clearFilters,
    toggleArrayFilter,
    getSearchFilters,
    hasActiveFilters
  } = useSearchFilters();

  const { generateTimeSlots } = useTimeSlots();
  
  // Estados locales
  const [searchResults, setSearchResults] = useState<SearchResult>({
    complejos: [],
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generar opciones de tiempo
  const timeSlots = generateTimeSlots('08:00', '23:00', 30);
  const durationOptions = [
    { value: 1, label: '1 hora' },
    { value: 1.5, label: '1.5 horas' },
    { value: 2, label: '2 horas' },
    { value: 2.5, label: '2.5 horas' },
    { value: 3, label: '3 horas' }
  ];

  // Ejecutar búsqueda cuando cambien los filtros
  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const searchFilters = getSearchFilters();
        const results = await searchComplexes(searchFilters);
        setSearchResults(results);
      } catch (err) {
        setError('Error al buscar complejos. Intenta nuevamente.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [getSearchFilters, setIsLoading]);

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Información de disponibilidad para mostrar en las cards
  const availabilityInfo = filters.fecha && filters.horaInicio && filters.duracion ? {
    fecha: new Date(filters.fecha).toLocaleDateString('es-AR'),
    hora: filters.horaInicio,
    duracion: filters.duracion
  } : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-argentinian-blue">
              Canchetia
            </Link>
            
            {/* Búsqueda principal en header para móvil */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar complejo..."
                  value={filters.nombreComplejo || ''}
                  onChange={(e) => updateFilter('nombreComplejo', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-argentinian-blue focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="hidden md:flex"
                >
                  Limpiar filtros
                </Button>
              )}
              
              {/* Toggle filtros móvil */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de filtros */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Limpiar
                  </Button>
                )}
              </div>

              {/* Búsqueda por nombre (móvil) */}
              <div className="mb-6 md:hidden">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar complejo
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nombre del complejo..."
                    value={filters.nombreComplejo || ''}
                    onChange={(e) => updateFilter('nombreComplejo', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-argentinian-blue focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtros de disponibilidad */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  Disponibilidad
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Fecha</label>
                    <input
                      type="date"
                      min={getMinDate()}
                      value={filters.fecha || ''}
                      onChange={(e) => updateFilter('fecha', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-argentinian-blue focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Hora</label>
                      <select
                        value={filters.horaInicio || ''}
                        onChange={(e) => updateFilter('horaInicio', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-argentinian-blue focus:border-transparent"
                      >
                        <option value="">Seleccionar</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Duración</label>
                      <select
                        value={filters.duracion || 2}
                        onChange={(e) => updateFilter('duracion', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-argentinian-blue focus:border-transparent"
                      >
                        {durationOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipo de cancha */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de cancha
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[5, 7, 8, 11].map(tipo => (
                    <label key={tipo} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.tipoCancha?.includes(tipo as any) || false}
                        onChange={() => toggleArrayFilter('tipoCancha', tipo)}
                        className="rounded border-gray-300 text-argentinian-blue focus:ring-argentinian-blue"
                      />
                      <span className="ml-2 text-sm text-gray-600">Fútbol {tipo}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Superficie */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Superficie
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'sintético', label: 'Césped sintético' },
                    { value: 'natural', label: 'Césped natural' },
                    { value: 'cemento', label: 'Cemento' }
                  ].map(superficie => (
                    <label key={superficie.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.tipoSuperficie?.includes(superficie.value as any) || false}
                        onChange={() => toggleArrayFilter('tipoSuperficie', superficie.value)}
                        className="rounded border-gray-300 text-argentinian-blue focus:ring-argentinian-blue"
                      />
                      <span className="ml-2 text-sm text-gray-600">{superficie.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Precio */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rango de precios (por hora)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                    <input
                      type="number"
                      placeholder="$0"
                      min="0"
                      step="1000"
                      value={filters.precioMin || ''}
                      onChange={(e) => updateFilter('precioMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-argentinian-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                    <input
                      type="number"
                      placeholder="$50,000"
                      min="0"
                      step="1000"
                      value={filters.precioMax || ''}
                      onChange={(e) => updateFilter('precioMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-argentinian-blue focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Características */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Características
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.esTechada === true}
                    onChange={(e) => updateFilter('esTechada', e.target.checked ? true : undefined)}
                    className="rounded border-gray-300 text-argentinian-blue focus:ring-argentinian-blue"
                  />
                  <span className="ml-2 text-sm text-gray-600">Solo canchas techadas</span>
                </label>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-3">
            {/* Header de resultados */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isLoading ? 'Buscando...' : `${searchResults.total} complejos encontrados`}
                </h2>
                {availabilityInfo && (
                  <p className="text-sm text-gray-600 mt-1">
                    Para {availabilityInfo.fecha} a las {availabilityInfo.hora} por {availabilityInfo.duracion}h
                  </p>
                )}
              </div>
              
              {/* Ordenamiento */}
              <div className="hidden md:flex items-center space-x-4">
                <select
                  value={filters.ordenarPor || 'nombre'}
                  onChange={(e) => updateFilter('ordenarPor', e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-argentinian-blue focus:border-transparent text-sm"
                >
                  <option value="nombre">Ordenar por nombre</option>
                  <option value="precio">Ordenar por precio</option>
                </select>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Grid de resultados */}
            <ComplexCardGrid
              complexes={searchResults.complejos}
              loading={isLoading}
              showAvailability={!!(filters.fecha && filters.horaInicio && filters.duracion)}
              availabilityInfo={availabilityInfo}
            />

            {/* Paginación */}
            {searchResults.totalPages > 1 && !isLoading && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(searchResults.totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === filters.page ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => updateFilter('page', page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}