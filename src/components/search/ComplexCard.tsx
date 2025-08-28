import React from 'react';
import Link from 'next/link';
import { MapPin, Star, Users, Home, Car, Utensils, ShirtIcon, Wifi } from 'lucide-react';
import { ComplexWithFields } from '@/lib/search/searchService';
import { Badge } from '@/components/ui';

interface ComplexCardProps {
  complex: ComplexWithFields;
  showAvailability?: boolean;
  availabilityInfo?: {
    fecha: string;
    hora: string;
    duracion: number;
  };
}

const FIELD_TYPE_LABELS = {
  5: 'F5',
  7: 'F7', 
  8: 'F8',
  11: 'F11'
};

const SURFACE_ICONS = {
  'sintético': '🌿',
  'natural': '🌱', 
  'cemento': '⚫'
};

const SERVICE_ICONS = {
  'Estacionamiento': Car,
  'Parrilla': Utensils,
  'Vestuarios': ShirtIcon,
  'WiFi': Wifi,
  // Agregar más según sea necesario
};

export default function ComplexCard({ 
  complex, 
  showAvailability = false,
  availabilityInfo 
}: ComplexCardProps) {
  const {
    id,
    nombre,
    direccion,
    ciudad,
    descripcion,
    telefono_contacto,
    canchas,
    servicios,
    precioDesde,
    precioHasta,
    calificacionPromedio
  } = complex;

  // Calcular estadísticas de las canchas
  const tiposCanchas = [...new Set(canchas.map(c => c.tipo_futbol))];
  const superficies = [...new Set(canchas.map(c => c.tipo_superficie))];
  const tieneTechadas = canchas.some(c => c.es_techada);
  const canchasDisponibles = showAvailability 
    ? canchas.filter(c => c.disponible).length 
    : canchas.length;

  // Servicios principales a mostrar (máximo 4)
  const serviciosPrincipales = servicios?.slice(0, 4) || [];

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Imagen Principal */}
      <div className="relative h-48 bg-gray-200">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Badge de disponibilidad */}
        {showAvailability && (
          <div className="absolute top-3 left-3">
            <Badge 
              variant={canchasDisponibles > 0 ? 'success' : 'secondary'}
              className="text-white font-semibold"
            >
              {canchasDisponibles > 0 
                ? `${canchasDisponibles} disponible${canchasDisponibles > 1 ? 's' : ''}`
                : 'Sin disponibilidad'
              }
            </Badge>
          </div>
        )}

        {/* Precio */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-sm font-semibold text-gray-900">
            {precioHasta 
              ? `${formatearPrecio(precioDesde)} - ${formatearPrecio(precioHasta)}`
              : `Desde ${formatearPrecio(precioDesde)}`
            }
          </span>
        </div>

        {/* Placeholder para imagen - TODO: Implementar cuando se agreguen imágenes */}
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <Home className="h-16 w-16" />
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Header con nombre y rating */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-1">
              {nombre}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{direccion}, {ciudad}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        {calificacionPromedio && (
          <div className="mb-3">
            {renderStars(calificacionPromedio)}
          </div>
        )}

        {/* Información de disponibilidad específica */}
        {showAvailability && availabilityInfo && canchasDisponibles > 0 && (
          <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <span className="text-sm font-medium">
                Disponible {availabilityInfo.fecha} a las {availabilityInfo.hora} 
                por {availabilityInfo.duracion}h
              </span>
            </div>
          </div>
        )}

        {/* Tipos de canchas disponibles */}
        <div className="flex items-center mb-3">
          <Users className="h-4 w-4 text-gray-500 mr-2" />
          <div className="flex space-x-2">
            {tiposCanchas.map(tipo => (
              <Badge key={tipo} variant="outline" size="sm">
                {FIELD_TYPE_LABELS[tipo]}
              </Badge>
            ))}
          </div>
          {tieneTechadas && (
            <Badge variant="outline" size="sm" className="ml-2">
              Techada
            </Badge>
          )}
        </div>

        {/* Superficies */}
        <div className="flex items-center mb-3">
          <Home className="h-4 w-4 text-gray-500 mr-2" />
          <div className="flex space-x-1 text-sm text-gray-600">
            {superficies.map((superficie, index) => (
              <span key={superficie} className="flex items-center">
                <span className="mr-1">{SURFACE_ICONS[superficie]}</span>
                {superficie.charAt(0).toUpperCase() + superficie.slice(1)}
                {index < superficies.length - 1 && <span className="mx-2">•</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Servicios */}
        {serviciosPrincipales.length > 0 && (
          <div className="flex items-center mb-4">
            <div className="flex space-x-3 text-gray-500">
              {serviciosPrincipales.map((servicio, index) => {
                const IconComponent = SERVICE_ICONS[servicio.servicio?.nombre as keyof typeof SERVICE_ICONS] || Car;
                return (
                  <IconComponent key={index} className="h-4 w-4" title={servicio.servicio?.nombre} />
                );
              })}
              {servicios && servicios.length > 4 && (
                <span className="text-sm text-gray-600">
                  +{servicios.length - 4} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Descripción corta */}
        {descripcion && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {descripcion}
          </p>
        )}

        {/* Stats de canchas */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>{canchas.length} cancha{canchas.length !== 1 ? 's' : ''}</span>
          {showAvailability && (
            <span className={canchasDisponibles > 0 ? 'text-green-600' : 'text-red-600'}>
              {canchasDisponibles > 0 
                ? `${canchasDisponibles} disponible${canchasDisponibles > 1 ? 's' : ''} ahora`
                : 'Sin disponibilidad'
              }
            </span>
          )}
        </div>

        {/* Botón de acción */}
        <Link
          href={`/buscar/${id}`}
          className="w-full bg-argentinian-blue text-white py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium text-center block"
        >
          {showAvailability && canchasDisponibles > 0 
            ? 'Reservar Ahora' 
            : 'Ver Detalles'
          }
        </Link>
      </div>
    </div>
  );
}

// Componente skeleton para loading
export function ComplexCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Imagen skeleton */}
      <div className="h-48 bg-gray-200" />
      
      {/* Contenido skeleton */}
      <div className="p-5">
        <div className="h-6 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
        
        <div className="flex space-x-2 mb-3">
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
        
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
        
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// Grid de cards para mostrar resultados
interface ComplexCardGridProps {
  complexes: ComplexWithFields[];
  loading?: boolean;
  showAvailability?: boolean;
  availabilityInfo?: {
    fecha: string;
    hora: string;
    duracion: number;
  };
}

export function ComplexCardGrid({ 
  complexes, 
  loading = false, 
  showAvailability = false,
  availabilityInfo 
}: ComplexCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <ComplexCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (complexes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <MapPin className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No se encontraron complejos
        </h3>
        <p className="text-gray-600 mb-4">
          {showAvailability 
            ? 'No hay complejos disponibles para la fecha y hora seleccionadas.'
            : 'Intenta ajustar tus filtros de búsqueda.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {complexes.map(complex => (
        <ComplexCard
          key={complex.id}
          complex={complex}
          showAvailability={showAvailability}
          availabilityInfo={availabilityInfo}
        />
      ))}
    </div>
  );
}