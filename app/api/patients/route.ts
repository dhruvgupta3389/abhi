import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { csvManager } from '@/lib/csvManager';

export async function GET(request: NextRequest) {
  try {
    const patients = csvManager.readCSV('patients.csv');

    const transformedPatients = patients
      .filter(patient => patient.is_active === 'true')
      .map(patient => ({
        id: patient.id,
        registrationNumber: patient.registration_number,
        aadhaarNumber: patient.aadhaar_number,
        name: patient.name,
        age: parseInt(patient.age),
        type: patient.type,
        pregnancyWeek: patient.pregnancy_week ? parseInt(patient.pregnancy_week) : undefined,
        contactNumber: patient.contact_number,
        emergencyContact: patient.emergency_contact,
        address: patient.address,
        weight: parseFloat(patient.weight),
        height: parseFloat(patient.height),
        bloodPressure: patient.blood_pressure,
        temperature: patient.temperature ? parseFloat(patient.temperature) : undefined,
        hemoglobin: patient.hemoglobin ? parseFloat(patient.hemoglobin) : undefined,
        nutritionStatus: patient.nutrition_status,
        medicalHistory: csvManager.safeJsonParse(patient.medical_history, []),
        symptoms: csvManager.safeJsonParse(patient.symptoms, []),
        documents: csvManager.safeJsonParse(patient.documents, []),
        photos: csvManager.safeJsonParse(patient.photos, []),
        remarks: patient.remarks,
        riskScore: parseInt(patient.risk_score) || 0,
        nutritionalDeficiency: csvManager.safeJsonParse(patient.nutritional_deficiency, []),
        bedId: patient.bed_id,
        lastVisitDate: patient.last_visit_date,
        nextVisitDate: patient.next_visit_date,
        registeredBy: patient.registered_by,
        registrationDate: patient.registration_date,
        admissionDate: patient.registration_date,
        nextVisit: patient.next_visit_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));

    return NextResponse.json(transformedPatients);
  } catch (err) {
    console.error('❌ Error fetching patients:', err);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.age || !body.type || !body.contactNumber || !body.address || !body.weight || !body.height || !body.nutritionStatus) {
      return NextResponse.json(
        { errors: [{ message: 'Missing required fields' }] },
        { status: 400 }
      );
    }

    const patientId = uuidv4();
    const registrationNumber = `NRC${Date.now()}`;

    const patientData = {
      id: patientId,
      registration_number: registrationNumber,
      aadhaar_number: body.aadhaarNumber || '',
      name: body.name,
      age: body.age.toString(),
      type: body.type,
      pregnancy_week: body.pregnancyWeek ? body.pregnancyWeek.toString() : '',
      contact_number: body.contactNumber,
      emergency_contact: body.emergencyContact || body.contactNumber,
      address: body.address,
      weight: body.weight.toString(),
      height: body.height.toString(),
      blood_pressure: body.bloodPressure || '',
      temperature: body.temperature ? body.temperature.toString() : '',
      hemoglobin: body.hemoglobin ? body.hemoglobin.toString() : '',
      nutrition_status: body.nutritionStatus,
      medical_history: JSON.stringify(body.medicalHistory || []),
      symptoms: JSON.stringify(body.symptoms || []),
      documents: JSON.stringify(body.documents || []),
      photos: JSON.stringify(body.photos || []),
      remarks: body.remarks || '',
      risk_score: (body.riskScore || 0).toString(),
      nutritional_deficiency: JSON.stringify(body.nutritionalDeficiency || []),
      bed_id: '',
      last_visit_date: '',
      next_visit_date: body.nextVisit || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      registered_by: body.registeredBy || 'SYSTEM',
      registration_date: new Date().toISOString().split('T')[0],
      is_active: 'true',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const success = csvManager.writeToCSV('patients.csv', patientData);

    if (success) {
      if (parseInt(patientData.risk_score) > 80 || patientData.nutrition_status === 'severely_malnourished') {
        const notificationData = {
          id: uuidv4(),
          user_role: 'supervisor',
          type: 'high_risk_alert',
          title: 'High Risk Patient Registered',
          message: `New high-risk patient ${patientData.name} has been registered with ${patientData.nutrition_status} status.`,
          priority: 'high',
          action_required: 'true',
          read_status: 'false',
          date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        };

        csvManager.writeToCSV('notifications.csv', notificationData);
      }

      return NextResponse.json(
        {
          message: 'Patient created successfully',
          id: patientId,
          registrationNumber: registrationNumber
        },
        { status: 201 }
      );
    } else {
      throw new Error('Failed to save patient data to CSV');
    }
  } catch (err) {
    console.error('❌ Error creating patient:', err);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
