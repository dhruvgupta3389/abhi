import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, employee_id } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
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

    // Query users table
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (queryError || !users) {
      console.log('User not found:', username);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password using bcryptjs
    const passwordMatch = await bcrypt.compare(password, users.password_hash);

    if (!passwordMatch) {
      console.log('Password mismatch for user:', username);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Return user data without password
    const userResponse = {
      id: users.id,
      employee_id: users.employee_id,
      username: users.username,
      name: users.name,
      role: users.role,
      email: users.email,
      contact_number: users.contact_number
    };

    console.log(`✅ User logged in: ${username} (Role: ${users.role})`);
    return NextResponse.json(
      {
        success: true,
        user: userResponse,
        message: 'Login successful'
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('❌ Login error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
