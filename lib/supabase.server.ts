'use server';

let supabaseClient: any = null;

async function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseClient;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return null;
  }
}

export async function querySupabase(table: string, options: any = {}) {
  const client = await getSupabaseClient();
  if (!client) return null;

  try {
    let query = client.from(table).select(options.select || '*');
    
    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        query = query.eq(key, value);
      }
    }

    if (options.limit) query = query.limit(options.limit);
    if (options.order) {
      const [column, direction] = options.order;
      query = query.order(column, { ascending: direction === 'asc' });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Supabase query failed for ${table}:`, error);
    return null;
  }
}

export async function insertSupabase(table: string, data: any) {
  const client = await getSupabaseClient();
  if (!client) return null;

  try {
    const { data: result, error } = await client.from(table).insert([data]).select();
    if (error) throw error;
    return result?.[0] || null;
  } catch (error) {
    console.error(`Supabase insert failed for ${table}:`, error);
    return null;
  }
}

export async function updateSupabase(table: string, id: string, data: any) {
  const client = await getSupabaseClient();
  if (!client) return null;

  try {
    const { data: result, error } = await client
      .from(table)
      .update(data)
      .eq('id', id)
      .select();
    if (error) throw error;
    return result?.[0] || null;
  } catch (error) {
    console.error(`Supabase update failed for ${table}:`, error);
    return null;
  }
}

export async function deleteSupabase(table: string, id: string) {
  const client = await getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Supabase delete failed for ${table}:`, error);
    return false;
  }
}
