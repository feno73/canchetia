'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { SearchFilters } from '@/lib/search/searchService';
import { FieldType, SurfaceType } from '@/types';

// Valores por defecto para los filtros
const DEFAULT_FILTERS: SearchFilters = {
  nombreComplejo: '',
  fecha: '',
  horaInicio: '',
  duracion: 2,
  tipoCancha: [],
  tipoSuperficie: [],
  esTechada: undefined,
  precioMin: undefined,
  precioMax: undefined,
  servicios: [],
  page: 1,
  limit: 12,
  ordenarPor: 'nombre',
  orden: 'asc'
};

export function useSearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Estado interno de filtros
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(false);
  
  // Debounce para búsqueda por texto
  const [debouncedNombreComplejo] = useDebounce(filters.nombreComplejo, 500);

  // Inicializar filtros desde URL al montar
  useEffect(() => {
    const urlFilters = parseFiltersFromURL(searchParams);
    setFilters(prev => ({ ...prev, ...urlFilters }));
  }, [searchParams]);

  // Actualizar URL cuando cambian los filtros (con debounce para texto)
  useEffect(() => {
    const filtersToSync = {
      ...filters,
      nombreComplejo: debouncedNombreComplejo
    };
    
    const url = buildURLFromFilters(filtersToSync);
    router.push(url, { scroll: false });
  }, [
    debouncedNombreComplejo,
    filters.fecha,
    filters.horaInicio,
    filters.duracion,
    filters.tipoCancha,
    filters.tipoSuperficie,
    filters.esTechada,
    filters.precioMin,
    filters.precioMax,
    filters.servicios,
    filters.page,
    filters.ordenarPor,
    filters.orden,
    router
  ]);

  // Actualizar un filtro específico
  const updateFilter = useCallback(<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Resetear página cuando cambia cualquier filtro excepto page
      ...(key !== 'page' && { page: 1 })
    }));
  }, []);

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Actualizar múltiples filtros a la vez
  const updateMultipleFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Resetear página
    }));
  }, []);

  // Toggle para filtros booleanos
  const toggleFilter = useCallback((key: keyof SearchFilters) => {
    setFilters(prev => {
      const currentValue = prev[key];
      let newValue;
      
      if (typeof currentValue === 'boolean') {
        newValue = currentValue === undefined ? true : !currentValue;
      } else if (currentValue === undefined) {
        newValue = true;
      } else {
        newValue = undefined;
      }
      
      return {
        ...prev,
        [key]: newValue,
        page: 1
      };
    });
  }, []);

  // Agregar/remover elemento de array
  const toggleArrayFilter = useCallback(<T>(
    key: keyof SearchFilters,
    value: T
  ) => {
    setFilters(prev => {
      const currentArray = (prev[key] as T[]) || [];
      const isIncluded = currentArray.includes(value);
      
      const newArray = isIncluded
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [key]: newArray,
        page: 1
      };
    });
  }, []);

  // Obtener filtros listos para la búsqueda (con texto debounced)
  const getSearchFilters = useCallback((): SearchFilters => {
    return {
      ...filters,
      nombreComplejo: debouncedNombreComplejo
    };
  }, [filters, debouncedNombreComplejo]);

  // Verificar si hay filtros activos
  const hasActiveFilters = useCallback(() => {
    return (
      debouncedNombreComplejo !== '' ||
      filters.fecha !== '' ||
      filters.horaInicio !== '' ||
      filters.tipoCancha?.length > 0 ||
      filters.tipoSuperficie?.length > 0 ||
      filters.esTechada !== undefined ||
      filters.precioMin !== undefined ||
      filters.precioMax !== undefined ||
      filters.servicios?.length > 0
    );
  }, [filters, debouncedNombreComplejo]);

  return {
    filters,
    debouncedNombreComplejo,
    isLoading,
    setIsLoading,
    updateFilter,
    clearFilters,
    updateMultipleFilters,
    toggleFilter,
    toggleArrayFilter,
    getSearchFilters,
    hasActiveFilters: hasActiveFilters()
  };
}

// Utilidades para conversión URL <-> Filtros

function parseFiltersFromURL(searchParams: URLSearchParams): Partial<SearchFilters> {
  const filters: Partial<SearchFilters> = {};

  // Texto
  const nombre = searchParams.get('q');
  if (nombre) filters.nombreComplejo = nombre;

  // Fecha y hora
  const fecha = searchParams.get('fecha');
  if (fecha) filters.fecha = fecha;

  const hora = searchParams.get('hora');
  if (hora) filters.horaInicio = hora;

  const duracion = searchParams.get('duracion');
  if (duracion) filters.duracion = parseFloat(duracion);

  // Tipo de cancha
  const tipo = searchParams.get('tipo');
  if (tipo) {
    filters.tipoCancha = tipo.split(',').map(t => parseInt(t) as FieldType);
  }

  // Superficie
  const superficie = searchParams.get('superficie');
  if (superficie) {
    filters.tipoSuperficie = superficie.split(',') as SurfaceType[];
  }

  // Techada
  const techada = searchParams.get('techada');
  if (techada === 'true') filters.esTechada = true;
  if (techada === 'false') filters.esTechada = false;

  // Precio
  const precioMin = searchParams.get('precio_min');
  if (precioMin) filters.precioMin = parseFloat(precioMin);

  const precioMax = searchParams.get('precio_max');
  if (precioMax) filters.precioMax = parseFloat(precioMax);

  // Servicios
  const servicios = searchParams.get('servicios');
  if (servicios) filters.servicios = servicios.split(',');

  // Paginación
  const page = searchParams.get('page');
  if (page) filters.page = parseInt(page);

  // Ordenamiento
  const ordenar = searchParams.get('ordenar');
  if (ordenar) filters.ordenarPor = ordenar as any;

  const orden = searchParams.get('orden');
  if (orden) filters.orden = orden as 'asc' | 'desc';

  return filters;
}

function buildURLFromFilters(filters: SearchFilters): string {
  const params = new URLSearchParams();

  // Solo agregar parámetros que tienen valor
  if (filters.nombreComplejo && filters.nombreComplejo.trim()) {
    params.set('q', filters.nombreComplejo.trim());
  }

  if (filters.fecha) {
    params.set('fecha', filters.fecha);
  }

  if (filters.horaInicio) {
    params.set('hora', filters.horaInicio);
  }

  if (filters.duracion && filters.duracion !== 2) {
    params.set('duracion', filters.duracion.toString());
  }

  if (filters.tipoCancha && filters.tipoCancha.length > 0) {
    params.set('tipo', filters.tipoCancha.join(','));
  }

  if (filters.tipoSuperficie && filters.tipoSuperficie.length > 0) {
    params.set('superficie', filters.tipoSuperficie.join(','));
  }

  if (typeof filters.esTechada === 'boolean') {
    params.set('techada', filters.esTechada.toString());
  }

  if (filters.precioMin !== undefined) {
    params.set('precio_min', filters.precioMin.toString());
  }

  if (filters.precioMax !== undefined) {
    params.set('precio_max', filters.precioMax.toString());
  }

  if (filters.servicios && filters.servicios.length > 0) {
    params.set('servicios', filters.servicios.join(','));
  }

  if (filters.page && filters.page > 1) {
    params.set('page', filters.page.toString());
  }

  if (filters.ordenarPor && filters.ordenarPor !== 'nombre') {
    params.set('ordenar', filters.ordenarPor);
  }

  if (filters.orden && filters.orden !== 'asc') {
    params.set('orden', filters.orden);
  }

  const queryString = params.toString();
  return queryString ? `/buscar?${queryString}` : '/buscar';
}

// Hook para generar opciones de horarios
export function useTimeSlots() {
  const generateTimeSlots = useCallback((
    apertura: string = '08:00',
    cierre: string = '23:00',
    intervalo: number = 30
  ): string[] => {
    const slots: string[] = [];
    const [horaApertura, minApertura] = apertura.split(':').map(Number);
    const [horaCierre, minCierre] = cierre.split(':').map(Number);
    
    let hora = horaApertura;
    let min = minApertura;
    
    while (hora < horaCierre || (hora === horaCierre && min < minCierre)) {
      const horaStr = `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      slots.push(horaStr);
      
      min += intervalo;
      if (min >= 60) {
        min = 0;
        hora++;
      }
    }
    
    return slots;
  }, []);

  return { generateTimeSlots };
}