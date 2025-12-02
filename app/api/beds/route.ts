import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospitalId') || undefined;
    const status = searchParams.get('status') || undefined;
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
    let query = supabase.from('beds').select('*');

    if (hospitalId) {
      query = query.eq('hospital_id', hospitalId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: beds, error, count } = await query
      .order('bed_number', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching beds:', error);
      return NextResponse.json(
        { error: 'Failed to fetch beds' },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${beds?.length || 0} beds`);
    return NextResponse.json(
      {
        data: beds || [],
        total: count || 0,
        count: beds?.length || 0
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

    const bedData = {
      hospital_id: body.hospitalId,
      bed_number: body.bedNumber,
      ward: body.ward,
      status: body.status || 'available',
      patient_id: body.patientId || null,
      admission_date: body.admissionDate || null,
      patient_name: body.patientName || null,
      patient_type: body.patientType || null,
      nutrition_status: body.nutritionStatus || null,
      hospital_name: body.hospitalName || null
    };

    const { data, error } = await supabase
      .from('beds')
      .insert([bedData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating bed:', error);
      return NextResponse.json(
        { error: 'Failed to create bed' },
        { status: 500 }
      );
    }

    console.log(`✅ Bed created: ${data.id}`);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
