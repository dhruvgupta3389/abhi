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

    console.log('🔍 Login attempt for:', username);
    console.log('📍 Supabase URL configured:', !!supabaseUrl);
    console.log('🔑 Supabase Key configured:', !!supabaseAnonKey);

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase not configured');
      return NextResponse.json(
        { error: 'Database not configured. Please check Supabase setup.' },
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

    if (queryError) {
      console.error('❌ Database query error:', queryError);
      console.error('Error code:', queryError.code);
      console.error('Error message:', queryError.message);
      return NextResponse.json(
        { error: `Database error: ${queryError.message}` },
        { status: 500 }
      );
    }

    if (!users) {
      console.log('User not found:', username);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password using bcryptjs
    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, users.password_hash);
    } catch (bcryptError) {
      console.error('❌ Bcrypt error:', bcryptError);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }

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

    // Generate a simple token (user ID + timestamp)
    const token = `${users.id}:${Date.now()}`;

    console.log(`✅ User logged in: ${username} (Role: ${users.role})`);
    return NextResponse.json(
      {
        success: true,
        user: userResponse,
        token: token,
        message: 'Login successful'
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('❌ Login error:', err);
    if (err instanceof Error) {
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
