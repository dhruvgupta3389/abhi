'use client';

import React, { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle, TrendingUp, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AIHealthPrediction: React.FC = () => {
  const { patients, t } = useApp();
  const [selectedPatient, setSelectedPatient] = useState<string>('');

  const riskPatients = patients?.filter(p => p.risk_score && p.risk_score >= 70) || [];
  const selectedPatientData = selectedPatient ? patients?.find(p => p.id === selectedPatient) : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Health Prediction</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <div>
                <p className="text-sm text-red-600">High Risk Patients</p>
                <p className="text-2xl font-bold text-red-800">{riskPatients.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-yellow-600">Moderate Risk</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {patients?.filter(p => p.risk_score && p.risk_score >= 50 && p.risk_score < 70)?.length || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Low Risk</p>
                <p className="text-2xl font-bold text-green-800">
                  {patients?.filter(p => !p.risk_score || p.risk_score < 50)?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Choose a patient...</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.name} - Risk: {patient.risk_score || 0}%
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPatientData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Analysis - {selectedPatientData.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Nutrition Status</span>
                  <span className="text-sm font-medium text-red-600">{selectedPatientData.nutrition_status}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Overall Risk Score</span>
                  <span className="text-sm font-medium text-red-600">{selectedPatientData.risk_score || 0}%</span>
                </div>
                {selectedPatientData.nutritional_deficiency && selectedPatientData.nutritional_deficiency.length > 0 && (
                  <div className="p-3 bg-red-50 rounded">
                    <p className="text-xs font-medium text-red-700">Deficiencies:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPatientData.nutritional_deficiency.map((def: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                          {def}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Regular monitoring and follow-ups</span>
                </li>
                <li className="flex items-start space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Nutritional supplementation</span>
                </li>
                <li className="flex items-start space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Increase medical check-ups frequency</span>
                </li>
                <li className="flex items-start space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Healthcare worker home visits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">High Risk Patients Requiring Immediate Attention</h3>
        <div className="space-y-3">
          {riskPatients.slice(0, 5).map(patient => (
            <div key={patient.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{patient.name}</h4>
                    <p className="text-sm text-gray-600">Age {patient.age} • {patient.type}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-red-800">Risk: {patient.riskScore}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIHealthPrediction;
