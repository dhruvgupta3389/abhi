import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = body.username?.trim()?.toLowerCase();
    const password = body.password;

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
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // ----------------------------------------------------------
    // 🔍 DEBUG QUERY — Check if username exists at all
    // ----------------------------------------------------------
    const debugUser = await supabase.from('users').select('*').eq('username', username);
    console.log('🔎 DEBUG — username match only:', debugUser.data);
    console.log('🔎 DEBUG ERROR:', debugUser.error);

    // ----------------------------------------------------------
    // MAIN USER QUERY
    // ----------------------------------------------------------
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      // REMOVE is_active filter for testing — add back later if needed
      // .eq('is_active', true)
      .maybeSingle();

    console.log('📌 Query result:', users);

    if (queryError) {
      console.error('❌ Database query error:', queryError);
      return NextResponse.json(
        { error: `Database error: ${queryError.message}` },
        { status: 500 }
      );
    }

    if (!users) {
      console.log('❌ No user found with username:', username);
      return NextResponse.json(
        { error: 'Invalid credentials – user not found' },
        { status: 401 }
      );
    }

    // ----------------------------------------------------------
    // PASSWORD CHECK
    // ----------------------------------------------------------
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
      console.log('❌ Password mismatch for:', username);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // ----------------------------------------------------------
    // LOGIN SUCCESS
    // ----------------------------------------------------------
    const userResponse = {
      id: users.id,
      employee_id: users.employee_id,
      username: users.username,
      name: users.name,
      role: users.role,
      email: users.email,
      contact_number: users.contact_number,
    };

    const token = `${users.id}:${Date.now()}`;

    console.log(`✅ User logged in: ${username} (Role: ${users.role})`);
    return NextResponse.json(
      {
        success: true,
        user: userResponse,
        token: token,
        message: 'Login successful',
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('❌ Login error:', err);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
