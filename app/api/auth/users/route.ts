import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: users, error } = await supabase
      .from('users')
      .select('id, employee_id, username, name, role, contact_number, email, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${users?.length || 0} users`);
    return NextResponse.json(users || [], { status: 200 });
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
    let { employeeId, username, password, name, role, contactNumber, email, createdBy } = body;

    if (!username || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: username, password, name, role' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (!employeeId) {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      employeeId = `EMP${timestamp}${random}`.substring(0, 12);
    }

    const { data: existingEmployee } = await supabase
      .from('users')
      .select('id')
      .eq('employee_id', employeeId)
      .single();

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 400 }
      );
    }

    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      id: userId,
      employee_id: employeeId,
      username: username,
      password_hash: hashedPassword,
      name: name,
      role: role,
      contact_number: contactNumber || null,
      email: email || null,
      is_active: true,
      created_by: createdBy || 'ADMIN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('users')
      .insert([userData]);

    if (error) {
      console.error('❌ Error creating user:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    console.log(`✅ User created: ${userId} (${employeeId})`);
    return NextResponse.json(
      {
        message: 'User created successfully',
        id: userId,
        employee_id: employeeId,
        username: username
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
