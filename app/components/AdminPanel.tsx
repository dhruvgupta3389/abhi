'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Users, Plus, Edit, Trash2, Eye, EyeOff, Key, UserCheck, AlertTriangle, CheckCircle, LogOut, Clock } from 'lucide-react';
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
  const { currentUser, logout } = useApp();
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
    const [formData, setFormData] = useState({
      employeeId: user?.employee_id || '',
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
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="EMP001"
                  disabled={!!user}
                />
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
                  <>
                    <span>{user ? 'Update User' : 'Create User'}</span>
                  </>
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Administration</h2>
            <p className="text-gray-600">Manage users, roles, and system access</p>
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

      {showAddForm && <UserForm onClose={() => setShowAddForm(false)} />}
      {editingUser && <UserForm user={editingUser} onClose={() => setEditingUser(null)} />}
    </div>
  );
};

export default AdminPanel;
