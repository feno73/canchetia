import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function insertTestData() {
  console.log('🔄 Inserting test data...');
  
  try {
    // 0. Insertar usuario admin de ejemplo
    const { data: usuario, error: usuarioError } = await supabase.auth.admin.createUser({
      email: 'admin@test.com',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        nombre: 'Admin',
        apellido: 'Test',
        rol: 'admin_complejo'
      }
    });

    if (usuarioError) {
      console.error('❌ Error creating user:', usuarioError);
      return;
    }

    console.log('✅ Usuario admin created:', usuario.user?.email);

    // Insertar en la tabla usuarios
    const { data: usuarioDB, error: usuarioDBError } = await supabase
      .from('usuarios')
      .insert({
        id: usuario.user!.id,
        email: usuario.user!.email,
        nombre: 'Admin',
        apellido: 'Test',
        rol: 'admin_complejo'
      })
      .select()
      .single();

    if (usuarioDBError) {
      console.error('❌ Error inserting usuario into DB:', usuarioDBError);
      return;
    }

    console.log('✅ Usuario DB record created');

    // 1. Insertar complejo de ejemplo
    const { data: complejo, error: complejoError } = await supabase
      .from('complejos')
      .insert({
        id_usuario_propietario: usuarioDB.id,
        nombre: 'Complejo Deportivo San Martín',
        direccion: 'Av. San Martín 1234',
        ciudad: 'Buenos Aires',
        descripcion: 'Moderno complejo deportivo con canchas de excelente calidad',
        telefono_contacto: '+54 11 1234-5678',
        horario_apertura: '08:00',
        horario_cierre: '23:00'
      })
      .select()
      .single();

    if (complejoError) {
      console.error('❌ Error inserting complejo:', complejoError);
      return;
    }

    console.log('✅ Complejo inserted:', complejo.nombre);

    // 2. Insertar canchas para el complejo
    const canchas = [
      {
        id_complejo: complejo.id,
        nombre: 'Cancha 1',
        tipo_futbol: 5,
        tipo_superficie: 'sintético',
        es_techada: true,
        precio_hora: 15000
      },
      {
        id_complejo: complejo.id,
        nombre: 'Cancha 2', 
        tipo_futbol: 7,
        tipo_superficie: 'natural',
        es_techada: false,
        precio_hora: 18000
      },
      {
        id_complejo: complejo.id,
        nombre: 'Cancha 3',
        tipo_futbol: 11,
        tipo_superficie: 'sintético',
        es_techada: false,
        precio_hora: 25000
      }
    ];

    const { data: canchasInserted, error: canchasError } = await supabase
      .from('canchas')
      .insert(canchas)
      .select();

    if (canchasError) {
      console.error('❌ Error inserting canchas:', canchasError);
      return;
    }

    console.log(`✅ ${canchasInserted.length} canchas inserted`);

    // 3. Insertar otro complejo
    const { data: complejo2, error: complejo2Error } = await supabase
      .from('complejos')
      .insert({
        id_usuario_propietario: usuarioDB.id,
        nombre: 'Club Atlético Racing',
        direccion: 'Av. Belgrano 567',
        ciudad: 'Buenos Aires',  
        descripcion: 'Club tradicional con instalaciones de primer nivel',
        telefono_contacto: '+54 11 9876-5432',
        horario_apertura: '09:00',
        horario_cierre: '22:00'
      })
      .select()
      .single();

    if (complejo2Error) {
      console.error('❌ Error inserting complejo2:', complejo2Error);
      return;
    }

    console.log('✅ Complejo2 inserted:', complejo2.nombre);

    // 4. Insertar canchas para el segundo complejo
    const canchas2 = [
      {
        id_complejo: complejo2.id,
        nombre: 'Cancha Principal',
        tipo_futbol: 11,
        tipo_superficie: 'natural',
        es_techada: false,
        precio_hora: 30000
      },
      {
        id_complejo: complejo2.id,
        nombre: 'Cancha Sintética',
        tipo_futbol: 8,
        tipo_superficie: 'sintético',
        es_techada: true,
        precio_hora: 20000
      }
    ];

    const { data: canchas2Inserted, error: canchas2Error } = await supabase
      .from('canchas')
      .insert(canchas2)
      .select();

    if (canchas2Error) {
      console.error('❌ Error inserting canchas2:', canchas2Error);
      return;
    }

    console.log(`✅ ${canchas2Inserted.length} more canchas inserted`);
    console.log('🎉 Test data inserted successfully!');

  } catch (error) {
    console.error('❌ Failed to insert test data:', error);
  }
}

insertTestData();