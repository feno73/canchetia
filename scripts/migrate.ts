import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';

// Load environment variables
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration(filename: string) {
  try {
    console.log(`Running migration: ${filename}`);
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', filename);
    const migrationSql = readFileSync(migrationPath, 'utf-8');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSql,
    });

    if (error) {
      console.error(`Error in migration ${filename}:`, error);
      throw error;
    }

    console.log(`✅ Migration ${filename} completed successfully`);
    return data;
  } catch (error) {
    console.error(`❌ Migration ${filename} failed:`, error);
    throw error;
  }
}

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Run migrations in order
    await runMigration('001_initial_schema.sql');
    await runMigration('002_rls_policies.sql');
    await runMigration('003_seed_data.sql');
    
    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();