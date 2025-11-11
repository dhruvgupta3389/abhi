'use client';

import React from 'react';
import { Bed, BarChart3, TrendingUp, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

const BedDashboard: React.FC = () => {
  const { beds, patients } = useApp();

  const stats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'available').length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length,
    occupancyRate: Math.round((beds.filter(b => b.status === 'occupied').length / beds.length) * 100),
  };

  const wardStats = beds.reduce((acc, bed) => {
    if (!acc[bed.ward]) {
      acc[bed.ward] = { total: 0, occupied: 0 };
    }
    acc[bed.ward].total++;
    if (bed.status === 'occupied') {
      acc[bed.ward].occupied++;
    }
    return acc;
  }, {} as Record<string, { total: number; occupied: number }>);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bed Management Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Bed className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Total Beds</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Available</p>
                <p className="text-2xl font-bold text-green-800">{stats.available}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-red-600 mr-2" />
              <div>
                <p className="text-sm text-red-600">Occupied</p>
                <p className="text-2xl font-bold text-red-800">{stats.occupied}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="w-6 h-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-yellow-600">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.maintenance}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="w-6 h-6 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600">Occupancy</p>
                <p className="text-2xl font-bold text-purple-800">{stats.occupancyRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ward-wise Occupancy</h3>
        <div className="space-y-4">
          {Object.entries(wardStats).map(([ward, stats]: [string, any]) => (
            <div key={ward} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{ward} Ward</span>
                <span className="text-sm text-gray-600">
                  {stats.occupied}/{stats.total} beds occupied
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(stats.occupied / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BedDashboard;
