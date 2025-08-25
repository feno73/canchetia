// Re-export all types from database
export * from './database';

// Additional utility types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface PageProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[]>;
}

export interface LayoutProps {
  children: React.ReactNode;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  rol: 'jugador' | 'admin_complejo';
}

export interface ComplexForm {
  nombre: string;
  direccion: string;
  ciudad: string;
  descripcion: string;
  telefono_contacto: string;
  horario_apertura: string;
  horario_cierre: string;
  servicios: string[];
}

export interface FieldForm {
  nombre: string;
  tipo_futbol: 5 | 7 | 8 | 11;
  tipo_superficie: 'sintético' | 'natural' | 'cemento';
  es_techada: boolean;
  precio_hora: number;
  fotos: File[];
}

export interface ReservationForm {
  id_cancha: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  metodo_pago: 'Mercado Pago' | 'efectivo';
}
