// Tipos basados en las entidades definidas en technical-definition.md

export type UserRole = 'jugador' | 'admin_complejo';

export type FieldType = 5 | 7 | 8 | 11;

export type SurfaceType = 'sintético' | 'natural' | 'cemento';

export type ReservationStatus = 'pendiente_pago' | 'confirmada' | 'cancelada' | 'completada';

export type PaymentMethod = 'Mercado Pago' | 'efectivo';

export type PaymentStatus = 'aprobado' | 'rechazado' | 'pendiente';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: UserRole;
  fecha_registro: string;
  created_at: string;
  updated_at: string;
}

export interface Complex {
  id: string;
  id_usuario_propietario: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  latitud: number;
  longitud: number;
  descripcion: string;
  telefono_contacto: string;
  horario_apertura: string; // HH:mm format
  horario_cierre: string; // HH:mm format
  created_at: string;
  updated_at: string;
  // Relations
  usuario_propietario?: User;
  canchas?: Field[];
  servicios?: Service[];
  resenas?: Review[];
}

export interface Field {
  id: string;
  id_complejo: string;
  nombre: string;
  tipo_futbol: FieldType;
  tipo_superficie: SurfaceType;
  es_techada: boolean;
  precio_hora: number;
  fotos: string[]; // Array of image URLs
  created_at: string;
  updated_at: string;
  // Relations
  complejo?: Complex;
  reservas?: Reservation[];
}

export interface Reservation {
  id: string;
  id_usuario: string;
  id_cancha: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  estado: ReservationStatus;
  precio_total: number;
  fecha_creacion: string;
  created_at: string;
  updated_at: string;
  // Relations
  usuario?: User;
  cancha?: Field;
  pago?: Payment;
}

export interface Payment {
  id: string;
  id_reserva: string;
  monto: number;
  metodo_pago: PaymentMethod;
  estado_pago: PaymentStatus;
  id_transaccion_externa?: string;
  fecha_pago: string;
  created_at: string;
  updated_at: string;
  // Relations
  reserva?: Reservation;
}

export interface Review {
  id: string;
  id_usuario: string;
  id_complejo: string;
  calificacion: number; // 1-5 stars
  comentario?: string;
  fecha_creacion: string;
  created_at: string;
  updated_at: string;
  // Relations
  usuario?: User;
  complejo?: Complex;
}

export interface Service {
  id: string;
  nombre: string;
  icono?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplexService {
  id_complejo: string;
  id_servicio: string;
  // Relations
  complejo?: Complex;
  servicio?: Service;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

// Search and filter types
export interface SearchFilters {
  ubicacion?: string;
  tipo_cancha?: FieldType[];
  tipo_superficie?: SurfaceType[];
  fecha?: string;
  hora_inicio?: string;
  hora_fin?: string;
  precio_min?: number;
  precio_max?: number;
  servicios?: string[];
  es_techada?: boolean;
}

export interface SearchResult {
  complejos: Complex[];
  total: number;
  page: number;
  limit: number;
}

// Dashboard types
export interface DashboardStats {
  reservas_hoy: number;
  ingresos_semana: number;
  ocupacion_porcentaje: number;
  canchas_mas_reservadas: {
    cancha: Field;
    reservas_count: number;
  }[];
}
