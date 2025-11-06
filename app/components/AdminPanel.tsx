'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Users, Plus, Edit, Trash2, Eye, EyeOff, Key, UserCheck, AlertTriangle, CheckCircle, LogOut, Clock, BarChart3, Activity, Server, TrendingUp, Home, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface User {
  id: string;
  employee_id: string;
  username: string;
  name: string;
  role: 'anganwadi_worker' | 'supervisor' | 'hospital' | 'admin';
  contact_number?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

const AdminPanel: React.FC = () => {
  const { currentUser, logout, patients, beds } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading users from database...');
      
      const response = await fetch('/api/auth/users');
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      
      const usersData = await response.json();
      setUsers(usersData);
      console.log('✅ Users loaded successfully:', usersData.length);
    } catch (err) {
      console.error('❌ Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'anganwadi_worker': return 'bg-green-100 text-green-800';
      case 'hospital': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'supervisor': return <UserCheck className="w-4 h-4" />;
      case 'anganwadi_worker': return <Users className="w-4 h-4" />;
      case 'hospital': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const UserForm = ({ user, onClose }: { user?: User; onClose: () => void }) => {
    const generateEmployeeId = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `EMP${timestamp}${random}`.substring(0, 12);
    };

    const [formData, setFormData] = useState({
      employeeId: user?.employee_id || generateEmployeeId(),
      username: user?.username || '',
      password: '',
      name: user?.name || '',
      role: user?.role || 'anganwadi_worker' as 'anganwadi_worker' | 'supervisor' | 'hospital' | 'admin',
      contactNumber: user?.contact_number || '',
      email: user?.email || '',
      isActive: user?.is_active ?? true
    });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        const url = user ? `/api/auth/users/${user.id}` : '/api/auth/users';
        const method = user ? 'PUT' : 'POST';
        
        const payload = {
          ...formData,
          createdBy: 'ADMIN001'
        };

        console.log(`📤 ${user ? 'Updating' : 'Creating'} user:`, payload);

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to ${user ? 'update' : 'create'} user`);
        }

        console.log(`✅ User ${user ? 'updated' : 'created'} successfully`);
        await loadUsers();
        onClose();
      } catch (err) {
        console.error(`❌ Error ${user ? 'updating' : 'creating'} user:`, err);
        setError(err instanceof Error ? err.message : `Failed to ${user ? 'update' : 'create'} user`);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {user ? 'Edit User' : 'Add New User'}
            </h3>
            {!user && <p className="text-sm text-gray-500 mt-1">Employee ID will be automatically generated</p>}
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.employeeId}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  {!user && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-white px-1">Auto-generated</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={!!user}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {user ? '(leave blank to keep current)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!user}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder={user ? 'Enter new password' : 'Enter password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="anganwadi_worker">Anganwadi Worker</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="hospital">Hospital Staff</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              {user && (
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Active User</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>{user ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <span>{user ? 'Update User' : 'Create User'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      console.log('🗑️ Deactivating user:', userId);
      
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate user');
      }

      console.log('✅ User deactivated successfully');
      await loadUsers();
    } catch (err) {
      console.error('❌ Error deactivating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to deactivate user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const activeUserCount = users.filter(u => u.is_active).length;
  const inactiveUserCount = users.filter(u => !u.is_active).length;
  const workerCount = users.filter(u => u.role === 'anganwadi_worker').length;
  const supervisorCount = users.filter(u => u.role === 'supervisor').length;
  const hospitalCount = users.filter(u => u.role === 'hospital').length;
  const patientCount = patients.length;
  const bedCount = beds.length;
  const availableBeds = beds.filter(b => b.status === 'available').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">System Administration</h2>
          <p className="text-gray-600 mt-1">Manage system, users, roles and configuration</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'overview'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'users'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" /> {activeUserCount} Active
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Patients</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{patientCount}</p>
                  <p className="text-xs text-blue-600 mt-2 flex items-center">
                    <Activity className="w-3 h-3 mr-1" /> Registered
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Beds</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{bedCount}</p>
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" /> {availableBeds} Available
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">System Status</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">Online</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <Server className="w-3 h-3 mr-1" /> All systems operational
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Server className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Anganwadi Workers</span>
                    <span className="text-sm font-bold text-gray-900">{workerCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${users.length > 0 ? (workerCount / users.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Supervisors</span>
                    <span className="text-sm font-bold text-gray-900">{supervisorCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${users.length > 0 ? (supervisorCount / users.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Hospital Staff</span>
                    <span className="text-sm font-bold text-gray-900">{hospitalCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${users.length > 0 ? (hospitalCount / users.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Admin User</span>
                  <span className="text-sm font-medium text-gray-900">{currentUser?.name || 'Admin'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">User ID</span>
                  <span className="text-sm font-medium text-gray-900">{currentUser?.employee_id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Session Status</span>
                  <span className="text-sm font-medium text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    System is operational and all components are running normally. Database connectivity is active.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Employee ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(-5).reverse().map(user => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.employee_id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_active ? (
                          <span className="text-xs font-medium text-green-700 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" /> Active
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-red-700 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <p className="text-gray-600">Manage system users and their access controls</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New User</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Employee ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.employee_id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit space-x-1 ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span>{user.role.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.contact_number || '-'}</td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="flex items-center space-x-1 text-sm text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-sm text-red-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Deactivate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddForm && <UserForm onClose={() => setShowAddForm(false)} />}
      {editingUser && <UserForm user={editingUser} onClose={() => setEditingUser(null)} />}
    </div>
  );
};

export default AdminPanel;
