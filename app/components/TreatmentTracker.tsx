'use client';

import React from 'react';
import { Activity, Heart, Pill, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TreatmentTracker: React.FC = () => {
  const { treatmentTrackers, patients, t } = useApp();

  const activeTrackers = treatmentTrackers.filter(t => !t.dischargeDate);
  const completedTrackers = treatmentTrackers.filter(t => t.dischargeDate);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Treatment Progress Tracking</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Active Treatment</p>
                <p className="text-2xl font-bold text-blue-800">{activeTrackers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-800">{completedTrackers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Pill className="w-6 h-6 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600">Total Patients</p>
                <p className="text-2xl font-bold text-purple-800">{treatmentTrackers.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Treatment Cases</h3>
        <div className="space-y-4">
          {activeTrackers.map(tracker => {
            const patient = patients.find(p => p.id === tracker.patientId);
            const latestProgress = tracker.dailyProgress[tracker.dailyProgress.length - 1];
            const duration = Math.ceil((new Date().getTime() - new Date(tracker.admissionDate).getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div key={tracker.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{patient?.name}</h4>
                    <p className="text-sm text-gray-600">{patient?.type === 'child' ? t('patient.child') : t('patient.pregnant')} • Age: {patient?.age}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Duration: {duration} days</p>
                    {latestProgress && (
                      <p className="text-sm text-gray-600">Weight: {latestProgress.weight} kg</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-600">Treatment Plan:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tracker.treatmentPlan.slice(0, 3).map((treatment, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {treatment}
                      </span>
                    ))}
                    {tracker.treatmentPlan.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{tracker.treatmentPlan.length - 3}
                      </span>
                    )}
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

export default TreatmentTracker;
