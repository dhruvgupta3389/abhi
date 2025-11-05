'use client';

import React, { useState } from 'react';
import { Activity, Plus, CheckCircle, Clock, User, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const BedCoordination: React.FC = () => {
  const { beds, patients, t } = useApp();
  const [filterWard, setFilterWard] = useState('all');

  const occupiedBeds = beds.filter(b => b.status === 'occupied');
  const availableBeds = beds.filter(b => b.status === 'available');
  const maintenanceBeds = beds.filter(b => b.status === 'maintenance');

  const filteredBeds = filterWard === 'all' ? beds : beds.filter(b => b.ward === filterWard);
  const wards = ['Pediatric', 'Maternity'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Bed Coordination Center</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Available</p>
                <p className="text-2xl font-bold text-blue-800">{availableBeds.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-red-600 mr-2" />
              <div>
                <p className="text-sm text-red-600">Occupied</p>
                <p className="text-2xl font-bold text-red-800">{occupiedBeds.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-yellow-600">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-800">{maintenanceBeds.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ward Filter</label>
          <select
            value={filterWard}
            onChange={(e) => setFilterWard(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Wards</option>
            {wards.map(ward => (
              <option key={ward} value={ward}>{ward}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBeds.map(bed => {
          const patient = bed.patientId ? patients.find(p => p.id === bed.patientId) : null;
          return (
            <div key={bed.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Bed {bed.number}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  bed.status === 'available' ? 'bg-green-100 text-green-800' :
                  bed.status === 'occupied' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {bed.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Ward:</span> {bed.ward}</div>
                {bed.status === 'occupied' && patient && (
                  <>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{patient.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(bed.admissionDate!).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BedCoordination;
