import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    let notifications = csvManager.readCSV('notifications.csv') || [];
    notifications = notifications.filter((n: any) => n.user_id === userId);
    notifications = notifications.slice(0, 100);

    console.log(`✅ Fetched ${notifications.length} notifications for user ${userId}`);
    return NextResponse.json(notifications, { status: 200 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const notificationData = {
      id: `notif-${Date.now()}`,
      user_id: body.userId,
      user_role: body.userRole,
      notification_type: body.type,
      title: body.title,
      message: body.message,
      priority: body.priority || 'medium',
      action_required: body.actionRequired ? 'true' : 'false',
      is_read: 'false',
      notification_date: new Date().toISOString()
    };

    const success = csvManager.writeToCSV('notifications.csv', notificationData);

    if (success) {
      console.log('✅ Notification created successfully:', notificationData.id);
      return NextResponse.json(notificationData, { status: 201 });
    } else {
      throw new Error('Failed to write notification data to CSV');
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
