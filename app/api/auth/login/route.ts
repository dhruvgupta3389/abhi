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

    const searchCriteria: any = {
      username: username,
      is_active: 'true'
    };

    if (employee_id) {
      searchCriteria.employee_id = employee_id;
    }

    const user = csvManager.findOne('users.csv', searchCriteria);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // In production, this should use bcrypt.compare but csvManager doesn't have async support
    // For now, validate against password_hash field if it exists
    const hasPasswordHash = user.password_hash && user.password_hash.startsWith('$2');
    let validPassword = false;

    if (hasPasswordHash) {
      // Password is hashed - need to use bcrypt for validation
      const bcrypt = require('bcryptjs');
      validPassword = await bcrypt.compare(password, user.password_hash);
    } else {
      // Fallback for legacy unhashed passwords (should be migrated)
      validPassword = false;
    }

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('❌ CRITICAL: JWT_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const expiresIn = parseExpires(process.env.JWT_EXPIRES_IN ?? '24h');
    const token = sign(
      {
        userId: user.id,
        employeeId: user.employee_id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

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
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
