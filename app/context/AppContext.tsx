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

export interface Visit {
  id: string;
  patient_id: string;
  scheduled_date: string;
  visit_type: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BedRequest {
  id: string;
  patient_id: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  medical_justification: string;
  current_condition: string;
  estimated_stay_duration: number;
  special_requirements?: string;
  requested_by: string;
  request_date: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface TreatmentTracker {
  id: string;
  patient_id: string;
  hospital_id: string;
  admission_date: string;
  discharge_date?: string;
  treatment_plan: string[];
  medicine_schedule: Array<{ medicine: string; dosage: string; frequency: string }>;
  doctor_remarks: string[];
  daily_progress: Array<{ date: string; weight?: number; appetite?: string; notes?: string }>;
  lab_reports: Array<{ date: string; type: string; results: string }>;
  created_at: string;
  updated_at: string;
}

interface AppContextType {
  // Language & Localization
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  t: (key: string, params?: Record<string, string | number>) => string;

  // User Management
  currentUser: User | null;
  userRole: string | null;
  setCurrentUser: (user: User, role?: string) => void;
  logout: () => void;
  hasAccess: (feature: string) => boolean;

  // Patients
  patients: Patient[];
  loadPatients: (registeredBy?: string) => Promise<void>;
  addPatient: (patient: Partial<Patient>) => Promise<Patient>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;

  // Beds
  beds: Bed[];
  loadBeds: (hospitalId?: string, status?: string) => Promise<void>;
  updateBed: (id: string, updates: Partial<Bed>) => Promise<void>;

  // Notifications
  notifications: Notification[];
  loadNotifications: (userId?: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;

  // Visits
  visits: Visit[];
  loadVisits: (patientId?: string) => Promise<void>;

  // Bed Requests
  bedRequests: BedRequest[];
  loadBedRequests: () => Promise<void>;
  addBedRequest: (request: Omit<BedRequest, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBedRequest: (id: string, updates: Partial<BedRequest>) => Promise<void>;

  // Treatment Trackers
  treatmentTrackers: TreatmentTracker[];
  loadTreatmentTrackers: (patientId?: string) => Promise<void>;
  addTreatmentTracker: (tracker: Omit<TreatmentTracker, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTreatmentTracker: (id: string, updates: Partial<TreatmentTracker>) => Promise<void>;

  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Translations
const translations: Record<string, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.patientRegistration': 'Patient Registration',
    'nav.bedAvailability': 'Bed Availability',
    'nav.notifications': 'Notifications',
    'nav.postHospitalization': 'Post-Hospitalization',
    'nav.aiPrediction': 'AI Predictions',
    'nav.medicalRecords': 'Medical Records',
    'nav.visitScheduling': 'Visit Scheduling',
    'nav.centerManagement': 'Center Management',
    'nav.workerManagement': 'Worker Management',
    'nav.visitTicketing': 'Visit Ticketing',
    'nav.surveyManagement': 'Survey Management',
    'nav.bedCoordination': 'Bed Coordination',
    'nav.admissionTracking': 'Admission Tracking',
    'nav.bedRequests': 'Bed Requests',
    'nav.bedDashboard': 'Bed Dashboard',
    'nav.treatmentTracker': 'Treatment Tracker',
    'nav.medicalReports': 'Medical Reports',
    'nav.bedDemandPrediction': 'Bed Demand Prediction',
  },
  hi: {
    'nav.dashboard': 'डैशबोर्ड',
    'nav.patientRegistration': 'रोगी पंजीकरण',
    'nav.bedAvailability': 'बिस्तर उपलब्धता',
    'nav.notifications': 'सूचनाएं',
    'nav.postHospitalization': 'पोस्ट-अस्पताल',
    'nav.aiPrediction': 'एआई भविष्यवाणी',
    'nav.medicalRecords': 'चिकित्सा रिकॉर्ड',
    'nav.visitScheduling': 'दौरे की योजना',
    'nav.centerManagement': 'केंद्र प्रबंधन',
    'nav.workerManagement': 'कार्यकर्ता प्रबंधन',
    'nav.visitTicketing': 'दौरा टिकटिंग',
    'nav.surveyManagement': 'सर्वेक्षण प्रबंधन',
    'nav.bedCoordination': 'बिस्तर समन्वय',
    'nav.admissionTracking': 'प्रवेश ट्रैकिंग',
    'nav.bedRequests': 'बिस्तर अनुरोध',
    'nav.bedDashboard': 'बिस्तर डैशबोर्ड',
    'nav.treatmentTracker': 'उपचार ट्रैकर',
    'nav.medicalReports': 'चिकित्सा रिपोर्टें',
    'nav.bedDemandPrediction': 'बिस्तर मांग भविष्यवाणी',
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'hi'>('en');
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [userRole, setUserRoleState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [bedRequests, setBedRequests] = useState<BedRequest[]>([]);
  const [treatmentTrackers, setTreatmentTrackers] = useState<TreatmentTracker[]>([]);

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language]?.[key] || translations['en']?.[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    
    return text;
  };

  // Set language
  const setLanguage = (lang: 'en' | 'hi') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Set current user
  const setCurrentUser = (user: User, role?: string) => {
    setCurrentUserState(user);
    setUserRoleState(role || user.role);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userRole', role || user.role);
  };

  // Logout
  const logout = () => {
    setCurrentUserState(null);
    setUserRoleState(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
  };

  // Check access for feature
  const hasAccess = (feature: string): boolean => {
    if (!userRole) return false;
    
    const roleAccess: Record<string, string[]> = {
      admin: ['all'],
      anganwadi_worker: [
        'patientRegistration', 'medicalRecords', 'visitScheduling',
        'bedAvailability', 'notifications', 'aiPrediction', 'postHospitalization'
      ],
      supervisor: [
        'centerManagement', 'workerManagement', 'patientRegistration',
        'medicalRecords', 'visitTicketing', 'surveyManagement',
        'bedCoordination', 'admissionTracking', 'notifications'
      ],
      hospital: [
        'bedDashboard', 'bedRequests', 'treatmentTracker', 'admissionTracking',
        'medicalReports', 'bedDemandPrediction', 'notifications'
      ]
    };

    const allowed = roleAccess[userRole] || [];
    return allowed.includes('all') || allowed.includes(feature);
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
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading patients';
      setError(message);
      console.error(message, err);
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
      setError(null);
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
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating patient';
      setError(message);
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
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading beds';
      setError(message);
      console.error(message, err);
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
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating bed';
      setError(message);
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
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading notifications';
      setError(message);
      console.error(message, err);
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
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error marking notification as read';
      setError(message);
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
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding notification';
      setError(message);
      throw err;
    }
  };

  // Visit Operations
  const loadVisits = async (patientId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', patientId);

      const response = await fetch(`/api/visits?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load visits');

      const data = await response.json();
      setVisits(data.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading visits';
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  // Bed Request Operations
  const loadBedRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bed-requests');
      if (!response.ok) throw new Error('Failed to load bed requests');

      const data = await response.json();
      setBedRequests(data.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading bed requests';
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  const addBedRequest = async (request: Omit<BedRequest, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/bed-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) throw new Error('Failed to add bed request');
      const data = await response.json();
      setBedRequests([...bedRequests, data]);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding bed request';
      setError(message);
      throw err;
    }
  };

  const updateBedRequest = async (id: string, updates: Partial<BedRequest>) => {
    try {
      const response = await fetch(`/api/bed-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update bed request');
      const data = await response.json();
      setBedRequests(bedRequests.map(req => req.id === id ? data : req));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating bed request';
      setError(message);
      throw err;
    }
  };

  // Treatment Tracker Operations
  const loadTreatmentTrackers = async (patientId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', patientId);

      const response = await fetch(`/api/treatment-trackers?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load treatment trackers');

      const data = await response.json();
      setTreatmentTrackers(data.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading treatment trackers';
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  const addTreatmentTracker = async (tracker: Omit<TreatmentTracker, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/treatment-trackers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tracker)
      });

      if (!response.ok) throw new Error('Failed to add treatment tracker');
      const data = await response.json();
      setTreatmentTrackers([...treatmentTrackers, data]);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding treatment tracker';
      setError(message);
      throw err;
    }
  };

  const updateTreatmentTracker = async (id: string, updates: Partial<TreatmentTracker>) => {
    try {
      const response = await fetch(`/api/treatment-trackers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update treatment tracker');
      const data = await response.json();
      setTreatmentTrackers(treatmentTrackers.map(tracker => tracker.id === id ? data : tracker));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating treatment tracker';
      setError(message);
      throw err;
    }
  };

  // Load current user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedRole = localStorage.getItem('userRole');
    const savedLanguage = localStorage.getItem('language') as 'en' | 'hi' | null;

    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUserState(user);
        setUserRoleState(savedRole || user.role);
      } catch (err) {
        console.error('Failed to parse saved user:', err);
      }
    }
  }, []);

  const value: AppContextType = {
    language,
    setLanguage,
    t,
    currentUser,
    userRole,
    setCurrentUser,
    logout,
    hasAccess,
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
    visits,
    loadVisits,
    bedRequests,
    loadBedRequests,
    addBedRequest,
    updateBedRequest,
    treatmentTrackers,
    loadTreatmentTrackers,
    addTreatmentTracker,
    updateTreatmentTracker,
    loading,
    error
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Export both hooks for compatibility
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Alias for backward compatibility
export const useApp = (): AppContextType => {
  return useAppContext();
};
