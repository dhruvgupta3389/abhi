import { NextRequest, NextResponse } from 'next/server';
import { sign, type Secret } from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
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
  let body: any = null;

  try {
    body = await request.json();
  } catch (parseErr) {
    console.error('❌ Failed to parse request body:', parseErr);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }

  try {
    const { username, password, employee_id } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const searchCriteria: any = {
      username: username,
      is_active: 'true'
    };

    if (employee_id) {
      searchCriteria.employee_id = employee_id;
    }

    const user = csvManager.findOne('users.csv', searchCriteria);

    if (!user) {
      console.log(`⚠️ User not found: ${username}`);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Validate password
    let validPassword = false;

    if (user.password_hash && user.password_hash.startsWith('$2')) {
      try {
        validPassword = await bcrypt.compare(password, user.password_hash);
      } catch (bcryptError) {
        console.error('❌ Bcrypt error:', bcryptError);
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 500 }
        );
      }
    } else if (user.password_hash === password) {
      validPassword = true;
    }

    if (!validPassword) {
      console.log(`⚠️ Invalid password for user: ${username}`);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ Using default JWT_SECRET - set JWT_SECRET env variable in production');
    }

    const expiresIn = parseExpires(process.env.JWT_EXPIRES_IN ?? '24h');
    const token = sign(
      {
        userId: user.id,
        employeeId: user.employee_id,
        role: user.role
      },
      jwtSecret,
      { expiresIn }
    );

    const responseData = {
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        role: user.role,
        contact_number: user.contact_number,
        email: user.email
      }
    };

    console.log(`✅ Login successful for user: ${username}`);
    return NextResponse.json(responseData, { status: 200 });
  } catch (err) {
    console.error('❌ Unexpected login error:', err);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
