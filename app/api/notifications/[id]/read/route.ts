import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

async function updateNotificationInSupabase(id: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select();

    if (error) return null;
    return data?.[0] || null;
  } catch (error) {
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Try Supabase first
    let result = await updateNotificationInSupabase(id);

    // Fallback to CSV
    if (!result) {
      const success = csvManager.updateCSV('notifications.csv', id, { is_read: 'true' });
      if (success) {
        result = csvManager.findOne('notifications.csv', { id });
      }
    }

    if (result) {
      console.log('✅ Notification marked as read:', id);
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
