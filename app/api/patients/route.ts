import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const registeredBy = searchParams.get('registeredBy') || undefined;
    const type = searchParams.get('type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    let query = supabase.from('patients').select('*');

    if (registeredBy) {
      query = query.eq('registered_by', registeredBy);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: patients, error, count } = await query
      .eq('is_active', true)
      .order('registration_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching patients:', error);
      return NextResponse.json(
        { error: 'Failed to fetch patients' },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${patients?.length || 0} patients`);
    return NextResponse.json(
      {
        data: patients || [],
        total: count || 0,
        count: patients?.length || 0
      },
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

export async function POST(request: NextRequest) {
  try {
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

    const registrationNumber = `REG-${Date.now()}`;

    const patientData = {
      registration_number: registrationNumber,
      name: body.name,
      age: body.age,
      type: body.type,
      pregnancy_week: body.pregnancyWeek || null,
      contact_number: body.contactNumber,
      emergency_contact: body.emergencyContact,
      address: body.address,
      weight: body.weight || null,
      height: body.height || null,
      blood_pressure: body.bloodPressure || null,
      temperature: body.temperature || null,
      hemoglobin: body.hemoglobin || null,
      nutrition_status: body.nutritionStatus,
      medical_history: body.medicalHistory || [],
      symptoms: body.symptoms || [],
      remarks: body.remarks,
      risk_score: body.riskScore || 0,
      nutritional_deficiency: body.nutritionalDeficiency || [],
      registered_by: body.registeredBy,
      registration_date: new Date().toISOString(),
      aadhaar_number: body.aadhaarNumber || null,
      last_visit_date: body.lastVisitDate || null,
      next_visit_date: body.nextVisitDate || null,
      is_active: true
    };

    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating patient:', error);
      return NextResponse.json(
        { error: 'Failed to create patient' },
        { status: 500 }
      );
    }

    console.log(`✅ Patient created: ${data.id}`);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
