'use client';

import React from 'react';
import { Building, Users, Activity, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AnganwadiManagement: React.FC = () => {
  const { anganwadis, workers } = useApp();

  const activeAnganwadis = anganwadis.filter(a => a.isActive);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Anganwadi Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Building className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Total Centers</p>
                <p className="text-2xl font-bold text-blue-800">{anganwadis.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Active Centers</p>
                <p className="text-2xl font-bold text-green-800">{activeAnganwadis.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600">Total Staff</p>
                <p className="text-2xl font-bold text-purple-800">{workers.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeAnganwadis.map(anganwadi => {
          const staffCount = workers.filter(w => w.anganwadiId === anganwadi.id).length;
          
          return (
            <div key={anganwadi.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{anganwadi.name}</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{anganwadi.location.area}, {anganwadi.location.district}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Supervisor</p>
                    <p className="text-sm font-medium text-gray-900">{anganwadi.supervisor.name}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Staff</p>
                    <p className="text-sm font-medium text-gray-900">{staffCount} members</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-pink-50 p-3 rounded">
                    <p className="text-xs text-pink-600 font-medium">Pregnant Women</p>
                    <p className="text-lg font-bold text-pink-800">{anganwadi.capacity.pregnantWomen}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-xs text-blue-600 font-medium">Children</p>
                    <p className="text-lg font-bold text-blue-800">{anganwadi.capacity.children}</p>
                  </div>
                </div>

                {anganwadi.facilities.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Facilities</p>
                    <div className="flex flex-wrap gap-1">
                      {anganwadi.facilities.slice(0, 2).map((facility: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {facility}
                        </span>
                      ))}
                      {anganwadi.facilities.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{anganwadi.facilities.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnganwadiManagement;
