import { createSupabaseClient } from '@/lib/supabase/client';
import { Complex, FieldType, SurfaceType } from '@/types';

export interface SearchFilters {
  // Búsqueda
  nombreComplejo?: string;
  
  // Disponibilidad (CRÍTICO)
  fecha?: string;                    // YYYY-MM-DD
  horaInicio?: string;              // HH:MM (ej: "18:00")
  duracion?: number;                // En horas (1, 1.5, 2)
  
  // Características de cancha
  tipoCancha?: FieldType[];         
  tipoSuperficie?: SurfaceType[];   
  esTechada?: boolean;              
  
  // Precio
  precioMin?: number;
  precioMax?: number;
  
  // Servicios
  servicios?: string[];
  
  // Paginación
  page?: number;
  limit?: number;
  
  // Ordenamiento
  ordenarPor?: 'nombre' | 'precio' | 'calificacion';
  orden?: 'asc' | 'desc';
}

export interface SearchResult {
  complejos: ComplexWithFields[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ComplexWithFields extends Complex {
  canchas: Array<{
    id: string;
    nombre: string;
    tipo_futbol: FieldType;
    tipo_superficie: SurfaceType;
    es_techada: boolean;
    precio_hora: number;
    disponible?: boolean;
  }>;
  servicios?: Array<{
    servicio: {
      nombre: string;
      icono?: string;
    };
  }>;
  precioDesde?: number;
  precioHasta?: number;
  calificacionPromedio?: number;
}

/**
 * Calcula la hora de fin basada en hora inicio y duración
 */
export function calcularHoraFin(horaInicio: string, duracion: number): string {
  const [hora, min] = horaInicio.split(':').map(Number);
  const totalMinutos = (hora * 60) + min + (duracion * 60);
  const nuevaHora = Math.floor(totalMinutos / 60);
  const nuevoMin = totalMinutos % 60;
  return `${nuevaHora.toString().padStart(2, '0')}:${nuevoMin.toString().padStart(2, '0')}`;
}

/**
 * Verifica si dos rangos de tiempo se superponen
 */
function hayConflictoHorario(
  inicio1: string, 
  fin1: string, 
  inicio2: string, 
  fin2: string
): boolean {
  return inicio1 < fin2 && fin1 > inicio2;
}

/**
 * Obtiene las canchas disponibles para una fecha y hora específica
 */
async function obtenerCanchasDisponibles(
  fecha: string,
  horaInicio: string,
  duracion: number
): Promise<string[]> {
  const supabase = createSupabaseClient();
  const horaFin = calcularHoraFin(horaInicio, duracion);
  
  try {
    // Buscar reservas que se superponen con el horario solicitado
    const { data: reservasConflicto, error } = await supabase
      .from('reservas')
      .select('id_cancha')
      .eq('fecha_hora_inicio', `${fecha}`)
      .or(`and(fecha_hora_inicio.lt.${fecha}T${horaFin}:00,fecha_hora_fin.gt.${fecha}T${horaInicio}:00)`);
    
    if (error) {
      console.error('Error fetching conflicting reservations:', error);
      return [];
    }
    
    // IDs de canchas ocupadas
    const canchasOcupadas = reservasConflicto?.map(r => r.id_cancha) || [];
    
    return canchasOcupadas;
  } catch (err) {
    console.error('Error in obtenerCanchasDisponibles:', err);
    return [];
  }
}

/**
 * Función principal de búsqueda de complejos
 */
export async function searchComplexes(filters: SearchFilters = {}): Promise<SearchResult> {
  const supabase = createSupabaseClient();
  
  const {
    nombreComplejo,
    fecha,
    horaInicio,
    duracion,
    tipoCancha,
    tipoSuperficie,
    esTechada,
    precioMin,
    precioMax,
    servicios,
    page = 1,
    limit = 12,
    ordenarPor = 'nombre',
    orden = 'asc'
  } = filters;

  try {
    // Paso 1: Obtener canchas ocupadas si se especifica disponibilidad
    let canchasOcupadas: string[] = [];
    if (fecha && horaInicio && duracion) {
      canchasOcupadas = await obtenerCanchasDisponibles(fecha, horaInicio, duracion);
    }

    // Paso 2: Construir query base (simplificada para debug)
    let query = supabase
      .from('complejos')
      .select(`
        *,
        canchas (
          id,
          nombre,
          tipo_futbol,
          tipo_superficie,
          es_techada,
          precio_hora
        )
      `);

    // Paso 3: Aplicar filtros
    
    // Filtro por nombre del complejo
    if (nombreComplejo && nombreComplejo.trim()) {
      query = query.ilike('nombre', `%${nombreComplejo.trim()}%`);
    }

    // TODO: Re-implementar filtros de canchas cuando se resuelvan los issues de relaciones
    // Filtro por tipo de cancha
    // if (tipoCancha && tipoCancha.length > 0) {
    //   query = query.in('canchas.tipo_futbol', tipoCancha);
    // }

    // Filtro por superficie
    // if (tipoSuperficie && tipoSuperficie.length > 0) {
    //   query = query.in('canchas.tipo_superficie', tipoSuperficie);
    // }

    // Filtro por techada
    // if (typeof esTechada === 'boolean') {
    //   query = query.eq('canchas.es_techada', esTechada);
    // }

    // Filtro por precio
    // if (precioMin !== undefined) {
    //   query = query.gte('canchas.precio_hora', precioMin);
    // }
    // if (precioMax !== undefined) {
    //   query = query.lte('canchas.precio_hora', precioMax);
    // }

    // Ordenamiento simple
    query = query.order('nombre', { ascending: orden === 'asc' });

    // Ejecutar query con count
    const { data: complejos, error, count } = await query
      .limit(limit)
      .range((page - 1) * limit, page * limit - 1);

    console.log('Search query result:', { complejos: complejos?.length, count, error });

    if (error) {
      console.error('Error in search query:', error);
      throw error;
    }

    if (!complejos) {
      return {
        complejos: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }

    // Paso 4: Procesar resultados y agregar información de disponibilidad
    const complejosProcessed = complejos.map((complejo: any) => {
      const canchas = complejo.canchas.map((cancha: any) => ({
        ...cancha,
        disponible: canchasOcupadas.length > 0 ? !canchasOcupadas.includes(cancha.id) : true
      }));

      // Calcular precios mínimo y máximo
      const precios = canchas.map(c => c.precio_hora);
      const precioDesde = Math.min(...precios);
      const precioHasta = Math.max(...precios);

      return {
        ...complejo,
        canchas,
        servicios: complejo.complejos_servicios || [],
        precioDesde,
        precioHasta: precioDesde === precioHasta ? undefined : precioHasta,
        calificacionPromedio: 4.5 // TODO: Calcular desde reseñas cuando se implemente
      };
    });

    // Si hay filtro de disponibilidad, filtrar complejos que no tienen canchas disponibles
    const complejosFilteredByAvailability = fecha && horaInicio && duracion
      ? complejosProcessed.filter(complejo => 
          complejo.canchas.some(cancha => cancha.disponible)
        )
      : complejosProcessed;

    return {
      complejos: complejosFilteredByAvailability,
      total: count || complejosFilteredByAvailability.length,
      page,
      limit,
      totalPages: Math.ceil((count || complejosFilteredByAvailability.length) / limit)
    };

  } catch (error) {
    console.error('Error in searchComplexes:', error);
    throw new Error('Error al buscar complejos');
  }
}

/**
 * Búsqueda simple por texto para homepage
 */
export async function searchComplexesByName(nombre: string): Promise<Complex[]> {
  const results = await searchComplexes({
    nombreComplejo: nombre,
    limit: 6 // Menos resultados para preview
  });
  
  return results.complejos;
}

/**
 * Obtener horarios disponibles para una fecha específica
 */
export async function getAvailableTimeSlots(
  complejoId: string,
  fecha: string,
  duracion: number = 2
): Promise<string[]> {
  const supabase = createSupabaseClient();
  
  try {
    // Obtener horarios de operación del complejo
    const { data: complejo, error: complejoError } = await supabase
      .from('complejos')
      .select('horario_apertura, horario_cierre')
      .eq('id', complejoId)
      .single();

    if (complejoError || !complejo) {
      return [];
    }

    // Generar slots de 30 minutos
    const slots: string[] = [];
    const apertura = complejo.horario_apertura; // "08:00"
    const cierre = complejo.horario_cierre;     // "23:00"
    
    const [horaApertura, minApertura] = apertura.split(':').map(Number);
    const [horaCierre, minCierre] = cierre.split(':').map(Number);
    
    let hora = horaApertura;
    let min = minApertura;
    
    while (hora < horaCierre || (hora === horaCierre && min < minCierre)) {
      const horaStr = `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      
      // Verificar que hay suficiente tiempo hasta el cierre
      const horaFinSlot = calcularHoraFin(horaStr, duracion);
      if (horaFinSlot <= `${horaCierre.toString().padStart(2, '0')}:${minCierre.toString().padStart(2, '0')}`) {
        slots.push(horaStr);
      }
      
      // Incrementar 30 minutos
      min += 30;
      if (min >= 60) {
        min = 0;
        hora++;
      }
    }

    return slots;

  } catch (error) {
    console.error('Error getting available time slots:', error);
    return [];
  }
}