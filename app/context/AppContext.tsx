'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  employee_id: string;
  name: string;
  role: 'anganwadi_worker' | 'supervisor' | 'hospital' | 'admin';
  contact_number?: string;
  email?: string;
}

export interface Patient {
  id: string;
  registrationNumber: string;
  aadhaarNumber?: string;
  name: string;
  age: number;
  type: 'child' | 'pregnant';
  pregnancyWeek?: number;
  contactNumber: string;
  emergencyContact?: string;
  address: string;
  weight: number;
  height: number;
  bloodPressure?: string;
  temperature?: number;
  hemoglobin?: number;
  nutritionStatus: 'normal' | 'malnourished' | 'severely_malnourished';
  medicalHistory: string[];
  symptoms: string[];
  documents: string[];
  photos: string[];
  remarks?: string;
  riskScore?: number;
  nutritionalDeficiency: string[];
  bedId?: string;
  lastVisitDate?: string;
  nextVisitDate?: string;
  registeredBy?: string;
  registrationDate: string;
  admissionDate: string;
  nextVisit: string;
}

export interface Bed {
  id: string;
  hospitalId: string;
  number: string;
  ward: string;
  status: 'available' | 'occupied' | 'maintenance';
  patientId?: string;
  admissionDate?: string;
  patientName?: string;
  patientType?: string;
  nutritionStatus?: string;
  hospitalName?: string;
}

export interface Notification {
  id: string;
  userRole: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  read: boolean;
  date: string;
}

// Additional exported domain types used by components
export interface Anganwadi {
  id: string;
  name: string;
  code: string;
  location: {
    area: string;
    district: string;
    state: string;
    pincode?: string;
    coordinates: { latitude: number; longitude: number };
  };
  supervisor: { name: string; contactNumber: string; employeeId: string };
  capacity: { pregnantWomen: number; children: number };
  facilities: string[];
  coverageAreas: string[];
  establishedDate: string;
  isActive: boolean;
}

export interface Worker {
  id: string;
  employeeId: string;
  name: string;
  role: 'head' | 'supervisor' | 'helper' | 'asha';
  anganwadiId?: string;
  contactNumber: string;
  address?: string;
  assignedAreas: string[];
  qualifications: string[];
  workingHours: { start: string; end: string };
  emergencyContact: { name: string; relation: string; contactNumber: string };
  joinDate: string;
  isActive: boolean;
}

export interface BedRequest {
  id: string;
  patientId: string;
  requestedBy: string;
  requestDate: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  medicalJustification: string;
  currentCondition: string;
  estimatedStayDuration: number;
  specialRequirements?: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  reviewedBy?: string;
  reviewDate?: string;
  reviewComments?: string;
  hospitalReferral?: {
    hospitalName: string;
    contactNumber: string;
    referralReason: string;
    referralDate: string;
    urgencyLevel: 'routine' | 'urgent' | 'emergency';
  };
}

export interface SurveyReport {
  id: string;
  patientId: string;
  date: string;
  observations: string;
  nutritionData: {
    appetite: 'poor' | 'moderate' | 'good';
    foodIntake: 'inadequate' | 'adequate' | 'excessive';
    supplements: string[];
  };
  symptoms: string[];
  recommendations: string[];
  healthWorkerId: string;
}

export interface Visit {
  id: string;
  patientId: string;
  healthWorkerId: string;
  scheduledDate: string;
  actualDate?: string;
  status: 'scheduled' | 'completed' | 'missed' | 'rescheduled';
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  visitType: 'routine' | 'emergency' | 'follow_up' | 'admission' | 'discharge';
  healthWorkerId: string;
  vitals: {
    weight: number;
    height: number;
    temperature?: number;
    bloodPressure?: string;
    pulse?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  symptoms: string[];
  diagnosis: string[];
  treatment: string[];
  medications: { name: string; dosage: string; frequency: string; duration: string }[];
  nutritionAssessment: {
    appetite: 'poor' | 'moderate' | 'good';
    foodIntake: 'inadequate' | 'adequate' | 'excessive';
    supplements: string[];
    dietPlan?: string;
  };
  labResults?: {
    hemoglobin?: number;
    bloodSugar?: number;
    proteinLevel?: number;
  };
  notes?: string;
  nextVisitDate?: string;
  followUpRequired: boolean;
}

export interface TreatmentTracker {
  id: string;
  patientId: string;
  hospitalId: string;
  admissionDate: string;
  treatmentPlan: string[];
  medicineSchedule: any[];
  doctorRemarks: string[];
  dailyProgress: { date: string; weight: number; appetite: 'poor' | 'moderate' | 'good'; notes: string }[];
  labReports: any[];
  dischargeDate?: string;
  dischargeSummary?: {
    finalWeight: number;
    nextCheckupDate: string;
    healthImprovement: string;
    followUpInstructions: string[];
  };
}

export interface MissedVisitTicket {
  id: string;
  patientId: string;
  visitId: string;
  dateReported: string;
  reportedBy: string;
  missedConditions: Record<string, boolean>;
  attemptDetails: {
    timeOfAttempt: string;
    locationVisited: string;
    contactMethod: 'home_visit' | 'phone_call' | 'center_visit' | string;
  };
  patientCondition: {
    currentHealthStatus: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    visibleSymptoms: string[];
    familyReportedConcerns: string[];
  };
  actionsTaken: string[];
  followUpRequired: boolean;
  nextAttemptDate: string;
  supervisorNotified: boolean;
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  escalationLevel: 'none' | 'anganwadi' | 'district' | 'state';
}

interface AppContextType {
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  t: (key: string, params?: Record<string, string | number>) => string;

  currentUser: User | null;
  userRole: string | null;
  setCurrentUser: (user: User, role: string) => void;
  logout: () => void;
  hasAccess: (feature: string) => boolean;

  patients: Patient[];
  beds: Bed[];
  notifications: Notification[];
  visits: Visit[];
  anganwadis: Anganwadi[];
  workers: Worker[];
  bedRequests: BedRequest[];
  medicalRecords: MedicalRecord[];
  surveys: SurveyReport[];
  aiPredictions: Record<string, unknown>[];
  missedVisitTickets: MissedVisitTicket[];
  visitTickets: Record<string, unknown>[];
  treatmentTrackers: TreatmentTracker[];

  addPatient: (patient: Omit<Patient, 'id' | 'registrationNumber' | 'admissionDate'>) => Promise<void>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  updateBed: (id: string, updates: Partial<Bed>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id'>) => Promise<void>;
  addVisitTicket: (ticket: Record<string, unknown>) => Promise<void>;
  updateVisitTicket: (id: string, updates: Record<string, unknown>) => Promise<void>;
  addMissedVisitTicket: (ticket: Record<string, unknown>) => Promise<void>;
  updateMissedVisitTicket: (id: string, updates: Record<string, unknown>) => Promise<void>;
  addBedRequest: (request: Omit<BedRequest, 'id'>) => Promise<void>;
  updateBedRequest: (id: string, updates: Partial<BedRequest>) => Promise<void>;
  addWorker: (worker: Omit<Worker, 'id'>) => Promise<void>;
  addAnganwadi: (anganwadi: Omit<Anganwadi, 'id'>) => Promise<void>;
  addSurvey: (survey: Omit<SurveyReport, 'id'>) => Promise<void>;
  addMedicalRecord: (record: Omit<MedicalRecord, 'id'>) => Promise<void>;
  addVisit: (visit: Omit<Visit, 'id'>) => Promise<void>;
  updateVisit: (id: string, updates: Partial<Visit>) => Promise<void>;
  addTreatmentTracker: (tracker: Omit<TreatmentTracker, 'id'>) => Promise<void>;
  updateTreatmentTracker: (id: string, updates: Partial<TreatmentTracker>) => Promise<void>;
  getPatientMedicalHistory: (patientId: string) => MedicalRecord[];

  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const translations = {
  en: {
    'system.title': 'NRC Management System',
    'system.subtitle': 'AI-Assisted Healthcare Management for SAM Children & Pregnant Women',
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
    'common.name': 'Name',
    'common.age': 'Age',
    'common.contact': 'Contact',
    'common.address': 'Address',
    'common.weight': 'Weight',
    'common.height': 'Height',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.time': 'Time',
    'common.actions': 'Actions',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.update': 'Update',
    'common.approve': 'Approve',
    'common.decline': 'Decline',
    'common.pending': 'Pending',
    'common.approved': 'Approved',
    'common.declined': 'Declined',
    'common.years': 'years',
    'common.yearsOld': 'years old',
    'patient.patient': 'Patient',
    'patient.child': 'Child',
    'patient.pregnant': 'Pregnant Woman',
    'patient.nutritionStatus': 'Nutrition Status',
    'patient.normal': 'Normal',
    'patient.malnourished': 'Malnourished',
    'patient.severelyMalnourished': 'Severely Malnourished',
    'bed.available': 'Available',
    'bed.occupied': 'Occupied',
    'bed.maintenance': 'Maintenance'
  },
  hi: {
    'system.title': 'एनआरसी प्रबंधन प्रणाली',
    'system.subtitle': 'एआई-सहायक स्वास्थ्य प्रबंधन SAM बच्चों और गर्भवती महिलाओं के लिए',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.patientRegistration': 'रोगी पंजीकरण',
    'nav.bedAvailability': 'बिस्तर उपलब्धता',
    'nav.notifications': 'सूचनाएं',
    'common.name': 'नाम',
    'common.age': 'आयु',
    'common.contact': 'संपर्क',
    'common.address': 'पता',
    'common.weight': 'वजन',
    'common.height': 'ऊंचाई',
    'common.status': 'स्थिति',
    'patient.child': 'बच्चा',
    'patient.pregnant': 'गर्भवती महिला'
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [anganwadis, setAnganwadis] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [bedRequests, setBedRequests] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [aiPredictions, setAiPredictions] = useState<any[]>([]);
  const [missedVisitTickets, setMissedVisitTickets] = useState<any[]>([]);
  const [visitTickets, setVisitTickets] = useState<any[]>([]);
  const [treatmentTrackers, setTreatmentTrackers] = useState<any[]>([]);

  const API_BASE_URL = '/api';

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = (translations[language] as Record<string, string>)[key] || key;
    if (params) {
      return translation.replace(/\{(\w+)\}/g, (match: string, paramKey: string) => String(params[paramKey]) || match);
    }
    return translation;
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ API call failed for ${endpoint}:`, error);
      throw error;
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading all data from CSV files...');

      try {
        const patientsData = await apiCall('/patients');
        setPatients(patientsData);
        console.log('✅ Patients loaded:', patientsData.length);
      } catch (err) {
        console.error('❌ Failed to load patients:', err);
      }

      try {
        const bedsData = await apiCall('/beds');
        setBeds(bedsData);
        console.log('✅ Beds loaded:', bedsData.length);
      } catch (err) {
        console.error('❌ Failed to load beds:', err);
      }

      if (userRole) {
        try {
          const notificationsData = await apiCall(`/notifications/role/${userRole}`);
          setNotifications(notificationsData);
          console.log('✅ Notifications loaded:', notificationsData.length);
        } catch (err) {
          console.error('❌ Failed to load notifications:', err);
        }
      }

      console.log('✅ All data loaded successfully from CSV files');
    } catch (err) {
      console.error('❌ Failed to load data from CSV:', err);
      setError('Failed to load data. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const setCurrentUser = (user: User, role: string) => {
    setCurrentUserState(user);
    setUserRole(role);
    const loginTime = new Date().getTime();
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userRole', role);
    localStorage.setItem('loginTime', loginTime.toString());
  };

  const logout = () => {
    setCurrentUserState(null);
    setUserRole(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('lastActivity');
  };

  const hasAccess = (feature: string): boolean => {
    if (!userRole) return false;

    const permissions: Record<string, string[]> = {
      admin: ['*'],
      anganwadi_worker: [
        'dashboard', 'patientRegistration', 'medicalRecords', 'visitScheduling',
        'bedAvailability', 'notifications', 'aiPrediction', 'postHospitalization'
      ],
      supervisor: [
        'dashboard', 'centerManagement', 'workerManagement', 'patientRegistration',
        'medicalRecords', 'visitTicketing', 'surveyManagement', 'bedCoordination',
        'admissionTracking', 'notifications', 'bedRequests'
      ],
      hospital: [
        'dashboard', 'bedDashboard', 'notifications', 'treatmentTracker',
        'medicalReports', 'bedDemandPrediction', 'patientRegistration', 'medicalRecords'
      ]
    };

    const userPermissions = permissions[userRole] || [];
    return userPermissions.includes('*') || userPermissions.includes(feature);
  };

  const addPatient = async (patientData: Omit<Patient, 'id' | 'registrationNumber' | 'admissionDate'>) => {
    try {
      console.log('📝 Adding new patient via API...');
      const response = await apiCall('/patients', {
        method: 'POST',
        body: JSON.stringify(patientData),
      });

      console.log('✅ Patient added successfully:', response);
      await loadAllData();
    } catch (error) {
      console.error('❌ Failed to add patient:', error);
      setError('Failed to add patient. Please try again.');
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      console.log(`📝 Updating patient ${id} via API...`);
      await apiCall(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      console.log('✅ Patient updated successfully');
      await loadAllData();
    } catch (error) {
      console.error('❌ Failed to update patient:', error);
      setError('Failed to update patient. Please try again.');
    }
  };

  const updateBed = async (id: string, updates: Partial<Bed>) => {
    try {
      console.log(`📝 Updating bed ${id} via API...`);
      await apiCall(`/beds/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      console.log('✅ Bed updated successfully');
      await loadAllData();
    } catch (error) {
      console.error('❌ Failed to update bed:', error);
      setError('Failed to update bed. Please try again.');
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      console.log(`📝 Marking notification ${id} as read via API...`);
      await apiCall(`/notifications/${id}/read`, {
        method: 'PUT',
      });

      console.log('✅ Notification marked as read');
      await loadAllData();
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
    }
  };

  const addNotification = async (notificationData: Omit<Notification, 'id'>) => {
    try {
      console.log('📝 Adding new notification via API...');
      await apiCall('/notifications', {
        method: 'POST',
        body: JSON.stringify(notificationData),
      });

      console.log('✅ Notification added successfully');
      await loadAllData();
    } catch (error) {
      console.error('❌ Failed to add notification:', error);
    }
  };

  const addVisitTicket = async (ticket: Record<string, unknown>) => {
    setVisitTickets([...visitTickets, { ...ticket, id: `ticket-${Date.now()}` }]);
  };

  const updateVisitTicket = async (id: string, updates: Record<string, unknown>) => {
    setVisitTickets(visitTickets.map(t => (t as Record<string, unknown>).id === id ? { ...t, ...updates } : t));
  };

  const addMissedVisitTicket = async (ticket: Record<string, unknown>) => {
    setMissedVisitTickets([...missedVisitTickets, { ...ticket, id: `missed-${Date.now()}` }]);
  };

  const updateMissedVisitTicket = async (id: string, updates: Record<string, unknown>) => {
    setMissedVisitTickets(missedVisitTickets.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addBedRequest = async (request: Omit<BedRequest, 'id'>) => {
    setBedRequests([...bedRequests, { ...request, id: `req-${Date.now()}` } as BedRequest]);
  };

  const updateBedRequest = async (id: string, updates: Partial<BedRequest>) => {
    setBedRequests(bedRequests.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addWorker = async (worker: Omit<Worker, 'id'>) => {
    setWorkers([...workers, { ...worker, id: `worker-${Date.now()}` } as Worker]);
  };

  const addAnganwadi = async (anganwadi: Omit<Anganwadi, 'id'>) => {
    setAnganwadis([...anganwadis, { ...anganwadi, id: `center-${Date.now()}` } as Anganwadi]);
  };

  const addSurvey = async (survey: Omit<SurveyReport, 'id'>) => {
    setSurveys([...surveys, { ...survey, id: `survey-${Date.now()}` } as SurveyReport]);
  };

  const addMedicalRecord = async (record: Omit<MedicalRecord, 'id'>) => {
    setMedicalRecords([...medicalRecords, { ...record, id: `record-${Date.now()}` } as MedicalRecord]);
  };

  const addVisit = async (visit: Omit<Visit, 'id'>) => {
    setVisits([...visits, { ...visit, id: `visit-${Date.now()}` } as Visit]);
  };

  const updateVisit = async (id: string, updates: Partial<Visit>) => {
    setVisits(visits.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const getPatientMedicalHistory = (patientId: string) => {
    return medicalRecords.filter(r => r.patientId === patientId);
  };

  const addTreatmentTracker = async (tracker: Omit<TreatmentTracker, 'id'>) => {
    setTreatmentTrackers([...treatmentTrackers, { ...tracker, id: `tracker-${Date.now()}` } as TreatmentTracker]);
  };

  const updateTreatmentTracker = async (id: string, updates: Partial<TreatmentTracker>) => {
    setTreatmentTrackers(treatmentTrackers.map(tracker =>
      tracker.id === id ? { ...tracker, ...updates } : tracker
    ));
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        const storedRole = localStorage.getItem('userRole');
        const loginTime = localStorage.getItem('loginTime');

        if (storedUser && storedRole && loginTime) {
          const SESSION_DURATION = 24 * 60 * 60 * 1000;
          const currentTime = new Date().getTime();
          const elapsed = currentTime - parseInt(loginTime);

          if (elapsed > SESSION_DURATION) {
            console.log('⏰ Session expired');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userRole');
            localStorage.removeItem('loginTime');
            localStorage.removeItem('lastActivity');
            setLoading(false);
            return;
          }

          setCurrentUserState(JSON.parse(storedUser));
          setUserRole(storedRole);
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        setError('Failed to initialize application');
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (currentUser && userRole) {
      loadAllData();
    }
  }, [currentUser, userRole]);

  useEffect(() => {
    if (!currentUser) return;

    const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
    const WARNING_TIME = 2 * 60 * 1000;
    let inactivityTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);

      warningTimer = setTimeout(() => {
        const shouldContinue = confirm('You will be logged out due to inactivity in 2 minutes. Click OK to stay logged in.');
        if (shouldContinue) {
          resetTimer();
        }
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      inactivityTimer = setTimeout(() => {
        console.log('⏰ Auto-logout due to inactivity');
        alert('You have been logged out due to inactivity.');
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [currentUser]);

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
    beds,
    notifications,
    visits,
    anganwadis,
    workers,
    bedRequests,
    medicalRecords,
    surveys,
    aiPredictions,
    missedVisitTickets,
    visitTickets,
    treatmentTrackers,

    addPatient,
    updatePatient,
    updateBed,
    markNotificationRead,
    addNotification,
    addVisitTicket,
    updateVisitTicket,
    addMissedVisitTicket,
    updateMissedVisitTicket,
    addBedRequest,
    updateBedRequest,
    addWorker,
    addAnganwadi,
    addSurvey,
    addMedicalRecord,
    addVisit,
    updateVisit,
    addTreatmentTracker,
    updateTreatmentTracker,
    getPatientMedicalHistory,

    loading,
    error,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
//11
