import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Error updating notification:', error);
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    console.log('✅ Notification marked as read:', id);
    return NextResponse.json(data[0], { status: 200 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
