'use client';

import React, { useState } from 'react';
import { UserCheck, Clock, CheckCircle, User, Calendar, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AdmissionTracking: React.FC = () => {
  const { beds, patients, t } = useApp();
  const [filterType, setFilterType] = useState('all');

  const admittedPatients = patients.filter(p => {
    const bed = beds.find(b => b.patient_id === p.id);
    return bed && bed.status === 'occupied';
  });

  const recentAdmissions = admittedPatients.slice(-5);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('admission.tracking')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <UserCheck className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Currently Admitted</p>
                <p className="text-2xl font-bold text-blue-800">{admittedPatients.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Total Patients</p>
                <p className="text-2xl font-bold text-green-800">{patients.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-yellow-600">Pending Discharge</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {admittedPatients.filter(p => {
                    const bed = beds.find(b => b.patient_id === p.id);
                    return bed && new Date(bed.admission_date!).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Admitted Patients</h3>
        <div className="space-y-4">
          {recentAdmissions.map(patient => {
            const bed = beds.find(b => b.patient_id === patient.id);
            const admissionDate = bed?.admission_date ? new Date(bed.admission_date) : new Date();
            const daysAdmitted = Math.floor((Date.now() - admissionDate.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{patient.name}</h4>
                    <p className="text-sm text-gray-600">
                      {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')} • Age: {patient.age}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Bed {bed?.bed_number} • {bed?.ward}
                  </p>
                  <div className="flex items-center space-x-1 mt-1 text-sm text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <span>{daysAdmitted} days admitted</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdmissionTracking;
