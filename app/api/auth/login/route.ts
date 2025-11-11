import { NextRequest, NextResponse } from 'next/server';
import { sign, type Secret } from 'jsonwebtoken';
import { csvManager } from '@/lib/csvManager';

function parseExpires(input: string | number | undefined): number {
  if (typeof input === 'number' && isFinite(input)) return input;
  const str = String(input ?? '').trim();
  const match = /^(\d+)\s*([smhdwy])?$/i.exec(str);
  if (!match) return 24 * 60 * 60; // default 24h
  const value = parseInt(match[1], 10);
  const unit = (match[2] || 's').toLowerCase();
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    case 'w': return value * 60 * 60 * 24 * 7;
    case 'y': return value * 60 * 60 * 24 * 365;
    default: return value;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, employee_id } = body;

    console.log('🔐 Login attempt for:', { username, employee_id });

    const searchCriteria: any = {
      username: username,
      is_active: 'true'
    };

    if (employee_id) {
      searchCriteria.employee_id = employee_id;
    }

    const user = csvManager.findOne('users.csv', searchCriteria);

    if (!user) {
      console.log('❌ User not found in CSV database');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('✅ User found in CSV database:', user.name);

    const validPassword = 
      password === 'worker123' || 
      password === 'super123' || 
      password === 'hosp123' || 
      password === 'admin123';

    if (!validPassword) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET ?? 'default-secret';
    const expiresIn = parseExpires(process.env.JWT_EXPIRES_IN ?? '24h');
    const token = sign(
      {
        userId: user.id,
        employeeId: user.employee_id,
        role: user.role
      },
      secret,
      { expiresIn }
    );

    console.log('✅ Login successful for:', user.name);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        role: user.role,
        contact_number: user.contact_number,
        email: user.email
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Login failed' },
      { status: 500 }
    );
  }
}
