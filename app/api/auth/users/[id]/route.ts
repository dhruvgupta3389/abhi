import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: user, error } = await supabase
      .from('users')
      .select('id, employee_id, username, name, role, contact_number, email, is_active, created_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.name) updateData.name = body.name;
    if (body.contactNumber) updateData.contact_number = body.contactNumber;
    if (body.email) updateData.email = body.email;
    if (body.role) updateData.role = body.role;

    if (body.password) {
      updateData.password_hash = await bcrypt.hash(body.password, 10);
    }

    if (body.isActive !== undefined) {
      updateData.is_active = body.isActive;
    }

    const { data: result, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, employee_id, username, name, role, contact_number, email, is_active')
      .single();

    if (error) {
      console.error('❌ Error updating user:', error);
      return NextResponse.json(
        { error: 'User not found or update failed' },
        { status: 404 }
      );
    }

    console.log(`✅ User updated: ${id}`);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting user:', error);
      return NextResponse.json(
        { error: 'User not found or delete failed' },
        { status: 404 }
      );
    }

    console.log(`✅ User deactivated: ${id}`);
    return NextResponse.json(
      { message: 'User deactivated successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
