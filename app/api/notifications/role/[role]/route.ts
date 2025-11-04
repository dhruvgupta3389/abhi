import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

export async function GET(
  request: NextRequest,
  { params }: { params: { role: string } }
) {
  try {
    const { role } = params;
    console.log(`📊 Fetching notifications for role ${role} from CSV...`);

    const notifications = csvManager.findByField('notifications.csv', 'user_role', role);

    const transformedNotifications = notifications.map(notification => ({
      id: notification.id,
      userRole: notification.user_role,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      actionRequired: notification.action_required === 'true',
      read: notification.read_status === 'true',
      date: notification.date
    }));

    console.log(`✅ Successfully retrieved ${transformedNotifications.length} notifications from CSV`);
    return NextResponse.json(transformedNotifications);
  } catch (err) {
    console.error('❌ Error fetching notifications:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
