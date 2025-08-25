import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

// Load .env.local explicitly
config({ path: path.join(process.cwd(), '.env.local') });

async function checkTables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Checking database tables...');

    // Get list of tables using information_schema
    const { data: tables, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    });

    if (error) {
      console.error('❌ Failed to check tables:', error);
      
      // Try alternative approach - just list some expected tables
      console.log('🔄 Trying alternative approach...');
      
      const expectedTables = [
        'usuarios', 'complejos', 'canchas', 'reservas', 
        'pagos', 'resenas', 'servicios', 'complejo_servicio'
      ];

      for (const tableName of expectedTables) {
        const { data, error: tableError } = await supabase
          .from(tableName)
          .select('count', { count: 'exact', head: true });

        if (tableError) {
          console.log(`❌ ${tableName}: Not found (${tableError.code})`);
        } else {
          console.log(`✅ ${tableName}: Exists`);
        }
      }
      return;
    }

    if (tables && tables.length > 0) {
      console.log('✅ Found tables in public schema:');
      tables.forEach((table: any) => {
        console.log(`  📋 ${table.table_name}`);
      });
    } else {
      console.log('❌ No tables found in public schema');
      console.log('💡 You need to run the database migrations first');
    }

  } catch (error) {
    console.error('💥 Failed to check tables:', error);
  }
}

checkTables();