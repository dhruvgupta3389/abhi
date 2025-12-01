import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const success = csvManager.updateCSV('notifications.csv', id, { is_read: 'true' });

    if (success) {
      console.log('✅ Notification marked as read:', id);
      const updated = csvManager.findOne('notifications.csv', { id });
      return NextResponse.json(updated, { status: 200 });
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
