// Script to create test data for development
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestData() {
  console.log('🚀 Creating test data...');

  try {
    // 1. Get or create admin user
    console.log('👤 Getting admin user...');
    
    // Check if admin user exists
    let userId = '';
    const { data: existingUsers } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', 'admin@canchetia.com')
      .limit(1);
    
    if (existingUsers && existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log('Admin user already exists');
    } else {
      // Create new admin user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@canchetia.com',
        password: 'Admin123456!',
        email_confirm: true,
        user_metadata: {
          full_name: 'Admin Complejo'
        }
      });

      if (authError) {
        throw authError;
      }

      userId = authData?.user?.id || '';
      
      // Create profile in usuarios table
      const { error: profileError } = await supabase
        .from('usuarios')
        .upsert({
          id: userId,
          nombre: 'Admin',
          apellido: 'Complejo',
          email: 'admin@canchetia.com',
          telefono: '+54 11 1234-5678',
          rol: 'admin_complejo',
        }, { onConflict: 'id' });

      if (profileError) {
        console.log('Profile error:', profileError.message);
      }
    }

    // 2. Create test complex
    console.log('🏟️ Creating test complex...');
    
    // Generate UUIDs
    const complexId = crypto.randomUUID();
    
    const { data: complexData, error: complexError } = await supabase
      .from('complejos')
      .upsert({
        id: complexId,
        id_usuario_propietario: userId,
        nombre: 'Complejo Deportivo San Martín',
        direccion: 'Av. San Martín 1234',
        ciudad: 'Buenos Aires',
        latitud: -34.6037,
        longitud: -58.3816,
        descripcion: 'Moderno complejo deportivo con canchas de fútbol 5, 7 y 11. Vestuarios, parrilla y estacionamiento disponible.',
        telefono_contacto: '+54 11 4444-5555',
        horario_apertura: '08:00',
        horario_cierre: '23:00',
      }, { onConflict: 'id' })
      .select()
      .single();

    if (complexError) {
      console.log('Complex error:', complexError.message);
    }

    // 3. Create test fields
    console.log('⚽ Creating test fields...');
    
    const fields = [
      {
        id: crypto.randomUUID(),
        id_complejo: complexId,
        nombre: 'Cancha 1 - Fútbol 5',
        tipo_futbol: 5,
        tipo_superficie: 'sintético',
        es_techada: true,
        precio_hora: 8000,
        fotos: ['https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop']
      },
      {
        id: crypto.randomUUID(),
        id_complejo: complexId,
        nombre: 'Cancha 2 - Fútbol 7',
        tipo_futbol: 7,
        tipo_superficie: 'sintético',
        es_techada: false,
        precio_hora: 12000,
        fotos: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop']
      },
      {
        id: crypto.randomUUID(),
        id_complejo: complexId, 
        nombre: 'Cancha 3 - Fútbol 11',
        tipo_futbol: 11,
        tipo_superficie: 'natural',
        es_techada: false,
        precio_hora: 18000,
        fotos: ['https://images.unsplash.com/photo-1518604666860-b6326c27c50b?w=800&h=600&fit=crop']
      }
    ];

    for (const field of fields) {
      const { error: fieldError } = await supabase
        .from('canchas')
        .upsert(field, { onConflict: 'id' });
      
      if (fieldError) {
        console.log(`Field error for ${field.nombre}:`, fieldError.message);
      }
    }

    // 4. Create test services
    console.log('🛠️ Creating test services...');
    
    const serviceIds = {
      parking: crypto.randomUUID(),
      grill: crypto.randomUUID(),
      locker: crypto.randomUUID(),
      bar: crypto.randomUUID(),
      wifi: crypto.randomUUID()
    };
    
    const services = [
      { id: serviceIds.parking, nombre: 'Estacionamiento', icono: '🚗' },
      { id: serviceIds.grill, nombre: 'Parrilla', icono: '🔥' },
      { id: serviceIds.locker, nombre: 'Vestuarios', icono: '🚿' },
      { id: serviceIds.bar, nombre: 'Bar/Buffet', icono: '🍔' },
      { id: serviceIds.wifi, nombre: 'WiFi', icono: '📶' }
    ];

    for (const service of services) {
      const { error: serviceError } = await supabase
        .from('servicios')
        .upsert(service, { onConflict: 'id' });
      
      if (serviceError) {
        console.log(`Service error for ${service.nombre}:`, serviceError.message);
      }
    }

    // 5. Link services to complex - skip for now if table doesn't exist
    console.log('🔗 Linking services to complex (optional)...');

    // 6. Create sample reservations
    console.log('📅 Creating sample reservations...');
    
    const reservations = [
      {
        id: crypto.randomUUID(),
        id_usuario: userId,
        id_cancha: fields[0].id,
        fecha_hora_inicio: '2025-08-25T18:00:00Z',
        fecha_hora_fin: '2025-08-25T19:00:00Z',
        estado: 'confirmada',
        precio_total: 8000,
        fecha_creacion: '2025-08-25T12:00:00Z'
      },
      {
        id: crypto.randomUUID(), 
        id_usuario: userId,
        id_cancha: fields[1].id,
        fecha_hora_inicio: '2025-08-25T19:00:00Z',
        fecha_hora_fin: '2025-08-25T20:00:00Z',
        estado: 'confirmada',
        precio_total: 12000,
        fecha_creacion: '2025-08-25T13:00:00Z'
      }
    ];

    for (const reservation of reservations) {
      const { error: resError } = await supabase
        .from('reservas')
        .upsert(reservation, { onConflict: 'id' });
      
      if (resError) {
        console.log('Reservation error:', resError.message);
      }
    }

    console.log('✅ Test data created successfully!');
    console.log('\n📝 Test credentials:');
    console.log('Email: admin@canchetia.com');
    console.log('Password: Admin123456!');
    console.log('Role: admin_complejo');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

// Run the script
createTestData().then(() => {
  console.log('🎉 Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});