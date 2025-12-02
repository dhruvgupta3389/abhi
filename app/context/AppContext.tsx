'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  employee_id: string;
  username: string;
  name: string;
  role: 'anganwadi_worker' | 'supervisor' | 'hospital' | 'admin';
  contact_number?: string;
  email?: string;
}

export interface Patient {
  id: string;
  registration_number: string;
  aadhaar_number?: string;
  name: string;
  age: number;
  type: 'child' | 'pregnant_woman' | 'lactating_mother';
  pregnancy_week?: number;
  contact_number: string;
  emergency_contact?: string;
  address: string;
  weight?: number;
  height?: number;
  blood_pressure?: string;
  temperature?: number;
  hemoglobin?: number;
  nutrition_status: string;
  medical_history?: any[];
  symptoms?: any[];
  remarks?: string;
  risk_score?: number;
  nutritional_deficiency?: any[];
  bed_id?: string;
  last_visit_date?: string;
  next_visit_date?: string;
  registered_by?: string;
  registration_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bed {
  id: string;
  hospital_id: string;
  bed_number: string;
  ward: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  patient_id?: string;
  admission_date?: string;
  patient_name?: string;
  patient_type?: string;
  nutrition_status?: string;
  hospital_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  user_role: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  action_required: boolean;
  is_read: boolean;
  action_url?: string;
  created_at: string;
  updated_at: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  logout: () => void;

  patients: Patient[];
  loadPatients: (registeredBy?: string) => Promise<void>;
  addPatient: (patient: Partial<Patient>) => Promise<Patient>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;

  beds: Bed[];
  loadBeds: (hospitalId?: string, status?: string) => Promise<void>;
  updateBed: (id: string, updates: Partial<Bed>) => Promise<void>;

  notifications: Notification[];
  loadNotifications: (userId?: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;

  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUserState(null);
    localStorage.removeItem('currentUser');
  };

  // Patient Operations
  const loadPatients = async (registeredBy?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (registeredBy) params.append('registeredBy', registeredBy);

      const response = await fetch(`/api/patients?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load patients');

      const data = await response.json();
      setPatients(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading patients');
    } finally {
      setLoading(false);
    }
  };

  const addPatient = async (patient: Partial<Patient>): Promise<Patient> => {
    try {
      setLoading(true);
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: patient.name,
          age: patient.age,
          type: patient.type,
          pregnancy_week: patient.pregnancy_week,
          contact_number: patient.contact_number,
          emergency_contact: patient.emergency_contact,
          address: patient.address,
          weight: patient.weight,
          height: patient.height,
          blood_pressure: patient.blood_pressure,
          temperature: patient.temperature,
          hemoglobin: patient.hemoglobin,
          nutrition_status: patient.nutrition_status,
          medical_history: patient.medical_history || [],
          symptoms: patient.symptoms || [],
          remarks: patient.remarks,
          risk_score: patient.risk_score,
          nutritional_deficiency: patient.nutritional_deficiency || [],
          registered_by: currentUser?.id,
          aadhaar_number: patient.aadhaar_number,
          last_visit_date: patient.last_visit_date,
          next_visit_date: patient.next_visit_date
        })
      });

      if (!response.ok) throw new Error('Failed to add patient');
      const data = await response.json();
      setPatients([...patients, data]);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding patient';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update patient');
      const data = await response.json();
      setPatients(patients.map(p => p.id === id ? data : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating patient');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bed Operations
  const loadBeds = async (hospitalId?: string, status?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (hospitalId) params.append('hospitalId', hospitalId);
      if (status) params.append('status', status);

      const response = await fetch(`/api/beds?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load beds');

      const data = await response.json();
      setBeds(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading beds');
    } finally {
      setLoading(false);
    }
  };

  const updateBed = async (id: string, updates: Partial<Bed>) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/beds/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update bed');
      const data = await response.json();
      setBeds(beds.map(b => b.id === id ? data : b));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating bed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Notification Operations
  const loadNotifications = async (userId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);

      const response = await fetch(`/api/notifications?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load notifications');

      const data = await response.json();
      setNotifications(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');
      const data = await response.json();
      setNotifications(notifications.map(n => n.id === id ? data : n));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error marking notification as read');
      throw err;
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });

      if (!response.ok) throw new Error('Failed to add notification');
      const data = await response.json();
      setNotifications([...notifications, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding notification');
      throw err;
    }
  };

  // Load current user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUserState(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved user:', err);
      }
    }
  }, []);

  const value: AppContextType = {
    currentUser,
    setCurrentUser,
    logout,
    patients,
    loadPatients,
    addPatient,
    updatePatient,
    beds,
    loadBeds,
    updateBed,
    notifications,
    loadNotifications,
    markNotificationRead,
    addNotification,
    loading,
    error
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
