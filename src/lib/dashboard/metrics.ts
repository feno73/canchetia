import { createSupabaseClient } from '@/lib/supabase/client';
import { DashboardStats } from '@/types';

/**
 * Get dashboard metrics for a specific admin user
 */
export async function getDashboardMetrics(userId: string): Promise<DashboardStats | null> {
  const supabase = createSupabaseClient();

  try {
    // Get user's complexes
    const { data: complexes, error: complexError } = await supabase
      .from('complejos')
      .select('id')
      .eq('id_usuario_propietario', userId);

    if (complexError) {
      console.error('Error fetching complexes:', complexError);
      return null;
    }

    if (!complexes || complexes.length === 0) {
      // No complexes found, return empty stats
      return {
        reservas_hoy: 0,
        ingresos_semana: 0,
        ocupacion_porcentaje: 0,
        canchas_mas_reservadas: []
      };
    }

    const complexIds = complexes.map(c => c.id);

    // Get today's reservations count
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    const { data: todayReservations, error: todayError } = await supabase
      .from('reservas')
      .select('id, canchas!inner(id_complejo)')
      .in('canchas.id_complejo', complexIds)
      .gte('fecha_hora_inicio', todayStart)
      .lt('fecha_hora_inicio', todayEnd)
      .eq('estado', 'confirmada');

    if (todayError) {
      console.error('Error fetching today reservations:', todayError);
    }

    // Get this week's revenue
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    const { data: weekReservations, error: weekError } = await supabase
      .from('reservas')
      .select('precio_total, canchas!inner(id_complejo)')
      .in('canchas.id_complejo', complexIds)
      .gte('fecha_hora_inicio', weekStart.toISOString())
      .eq('estado', 'confirmada');

    if (weekError) {
      console.error('Error fetching week reservations:', weekError);
    }

    const weeklyRevenue = weekReservations?.reduce((sum, res) => sum + (res.precio_total || 0), 0) || 0;

    // Get most reserved fields
    const { data: fieldStats, error: fieldError } = await supabase
      .from('reservas')
      .select(`
        id_cancha,
        canchas!inner(
          id,
          nombre,
          tipo_futbol,
          tipo_superficie,
          id_complejo
        )
      `)
      .in('canchas.id_complejo', complexIds)
      .eq('estado', 'confirmada')
      .gte('fecha_hora_inicio', weekStart.toISOString());

    if (fieldError) {
      console.error('Error fetching field stats:', fieldError);
    }

    // Count reservations per field
    const fieldCounts: { [key: string]: { count: number; field: any } } = {};
    
    fieldStats?.forEach((reservation: any) => {
      const fieldId = reservation.id_cancha;
      if (!fieldCounts[fieldId]) {
        fieldCounts[fieldId] = {
          count: 0,
          field: reservation.canchas
        };
      }
      fieldCounts[fieldId].count++;
    });

    // Sort by count and take top fields
    const topFields = Object.values(fieldCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(({ count, field }) => ({
        cancha: {
          id: field.id,
          id_complejo: field.id_complejo,
          nombre: field.nombre,
          tipo_futbol: field.tipo_futbol,
          tipo_superficie: field.tipo_superficie,
          es_techada: false, // Default value
          precio_hora: 0, // Default value
          fotos: [],
          created_at: '',
          updated_at: ''
        },
        reservas_count: count
      }));

    // Calculate occupancy percentage
    // Simplified calculation: (reservations this week / total possible slots) * 100
    const totalFields = await supabase
      .from('canchas')
      .select('id')
      .in('id_complejo', complexIds);

    const fieldCount = totalFields.data?.length || 1;
    const daysInWeek = 7;
    const hoursPerDay = 12; // Assuming 12 hours operation per day
    const totalPossibleSlots = fieldCount * daysInWeek * hoursPerDay;
    const actualReservations = weekReservations?.length || 0;
    const occupancyPercentage = Math.round((actualReservations / totalPossibleSlots) * 100);

    return {
      reservas_hoy: todayReservations?.length || 0,
      ingresos_semana: weeklyRevenue,
      ocupacion_porcentaje: Math.min(occupancyPercentage, 100), // Cap at 100%
      canchas_mas_reservadas: topFields
    };

  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    return null;
  }
}

/**
 * Get recent reservations for the dashboard
 */
export async function getRecentReservations(userId: string, limit = 10) {
  const supabase = createSupabaseClient();

  try {
    const { data: reservations, error } = await supabase
      .from('reservas')
      .select(`
        id,
        fecha_hora_inicio,
        fecha_hora_fin,
        estado,
        precio_total,
        fecha_creacion,
        usuarios!inner(nombre, apellido, email),
        canchas!inner(
          nombre,
          tipo_futbol,
          complejos!inner(
            id,
            nombre,
            id_usuario_propietario
          )
        )
      `)
      .eq('canchas.complejos.id_usuario_propietario', userId)
      .order('fecha_creacion', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent reservations:', error);
      return [];
    }

    return reservations || [];
  } catch (error) {
    console.error('Error getting recent reservations:', error);
    return [];
  }
}