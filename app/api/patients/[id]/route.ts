import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    console.log(`📝 Updating patient ${id} in CSV with data:`, JSON.stringify(body, null, 2));

    const updates: Record<string, any> = { ...body };

    if (updates.contactNumber) {
      updates.contact_number = updates.contactNumber;
      delete updates.contactNumber;
    }
    if (updates.nutritionStatus) {
      updates.nutrition_status = updates.nutritionStatus;
      delete updates.nutritionStatus;
    }
    if (updates.medicalHistory) {
      updates.medical_history = JSON.stringify(updates.medicalHistory);
      delete updates.medicalHistory;
    }

    updates.updated_at = new Date().toISOString();

    console.log('💾 Executing CSV update...');
    const success = csvManager.updateCSV('patients.csv', id, updates);

    if (success) {
      console.log('✅ Patient successfully updated in CSV database');
      return NextResponse.json({ message: 'Patient updated successfully' });
    } else {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error('❌ Error updating patient in CSV:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update patient' },
      { status: 500 }
    );
  }
}
