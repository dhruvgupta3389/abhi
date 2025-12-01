import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

async function getBedsFromSupabase(hospitalId?: string, status?: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    let query = supabase.from('beds').select('*');

    if (hospitalId) query = query.eq('hospital_id', hospitalId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('bed_number', { ascending: true });

    if (error) return null;
    return data || [];
  } catch (error) {
    return null;
  }
}

async function createBedInSupabase(bedData: any) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.from('beds').insert([bedData]).select();

    if (error) return null;
    return data?.[0] || null;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospitalId') || undefined;
    const status = searchParams.get('status') || undefined;

    // Try Supabase first
    let beds = await getBedsFromSupabase(hospitalId, status);

    // Fallback to CSV
    if (!beds) {
      beds = csvManager.readCSV('beds.csv') || [];
      if (hospitalId) beds = beds.filter((b: any) => b.hospital_id === hospitalId);
      if (status) beds = beds.filter((b: any) => b.status === status);
    }

    console.log(`✅ Fetched ${beds.length} beds`);
    return NextResponse.json(beds, { status: 200 });
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

    // Try Supabase first
    let result = await createBedInSupabase(bedData);

    // Fallback to CSV
    if (!result) {
      const csvData = { id: `bed-${Date.now()}`, ...bedData };
      const success = csvManager.writeToCSV('beds.csv', csvData);
      result = success ? csvData : null;
    }

    if (result) {
      console.log('✅ Bed created successfully:', result.id);
      return NextResponse.json(result, { status: 201 });
    } else {
      throw new Error('Failed to create bed');
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
