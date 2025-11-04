import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { csvManager } from '@/lib/csvManager';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching all users from CSV database...');

    const users = csvManager.readCSV('users.csv');

    const safeUsers = users.map(user => ({
      id: user.id,
      employee_id: user.employee_id,
      username: user.username,
      name: user.name,
      role: user.role,
      contact_number: user.contact_number,
      email: user.email,
      is_active: user.is_active === 'true',
      created_at: user.created_at
    }));

    console.log(`✅ Successfully retrieved ${safeUsers.length} users from CSV`);
    return NextResponse.json(safeUsers);
  } catch (err) {
    console.error('❌ Error fetching users from CSV:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, username, password, name, role, contactNumber, email, createdBy } = body;

    console.log('📝 Creating new user in CSV:', JSON.stringify(body, null, 2));

    if (!employeeId || !username || !password || !name || !role) {
      return NextResponse.json(
        { errors: [{ message: 'Missing required fields' }] },
        { status: 400 }
      );
    }

    const existingUser = csvManager.findOne('users.csv', { employee_id: employeeId });
    const existingUsername = csvManager.findOne('users.csv', { username: username });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 400 }
      );
    }

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 12);

    const userData = {
      id: userId,
      employee_id: employeeId,
      username: username,
      password_hash: hashedPassword,
      name: name,
      role: role,
      contact_number: contactNumber || '',
      email: email || '',
      is_active: 'true',
      created_by: createdBy || 'ADMIN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const success = csvManager.writeToCSV('users.csv', userData);

    if (success) {
      console.log('✅ User successfully created in CSV database with ID:', userId);
      return NextResponse.json(
        { message: 'User created successfully', id: userId },
        { status: 201 }
      );
    } else {
      throw new Error('Failed to write user data to CSV');
    }
  } catch (err) {
    console.error('❌ Error creating user in CSV:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create user' },
      { status: 500 }
    );
  }
}
