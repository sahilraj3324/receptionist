// Centralized API Service for Receptionist Portal
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include', // IMPORTANT: Send cookies with requests
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== RECEPTIONIST API ====================
export interface Receptionist {
  id: string;
  name: string;
  number: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ReceptionistLoginRequest {
  email: string;
  password: string;
}

export interface CreateReceptionistRequest {
  name: string;
  number: string;
  username: string;
  email: string;
  password: string;
}

export const receptionistApi = {
  login: (credentials: ReceptionistLoginRequest) =>
    apiCall<Receptionist>('/receptionist/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: CreateReceptionistRequest) =>
    apiCall<Receptionist>('/receptionist', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () => apiCall<Receptionist[]>('/receptionist'),
  
  getById: (id: string) => apiCall<Receptionist>(`/receptionist/${id}`),
  
  update: (id: string, data: Partial<CreateReceptionistRequest>) =>
    apiCall<Receptionist>(`/receptionist/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ==================== USER/PATIENT API ====================
export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  contact_number?: string;
  gender?: string;
  date_of_birth?: string;
  blood_group?: string;
  city?: string;
  created_at: string;
}

export const patientApi = {
  getAll: () => apiCall<User[]>('/users?role=patient'),
  getById: (id: string) => apiCall<User>(`/users/${id}`),
  create: (data: any) => apiCall<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiCall<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/users/${id}`, { method: 'DELETE' }),
};

// ==================== DOCTOR API ====================
export interface Doctor {
  doctor_id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  city?: string;
  phone_number?: string;
  is_active: boolean;
  clinic_name?: string;
  clinic_address?: string;
}

export const doctorApi = {
  getAll: () => apiCall<Doctor[]>('/doctors'),
  getById: (id: string) => apiCall<Doctor>(`/doctors/${id}`),
  create: (data: any) => apiCall<Doctor>('/doctors', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiCall<Doctor>(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/doctors/${id}`, { method: 'DELETE' }),
  getSpecializations: () => apiCall<string[]>('/doctors/specializations'),
};

// ==================== APPOINTMENT API ====================
export interface Appointment {
  appointment_id: number;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export const appointmentApi = {
  getAll: () => apiCall<Appointment[]>('/appointments'),
  getById: (id: number) => apiCall<Appointment>(`/appointments/${id}`),
  create: (data: any) =>
    apiCall<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) =>
    apiCall<Appointment>(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id: number, status: string) =>
    apiCall<Appointment>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  delete: (id: number) => apiCall(`/appointments/${id}`, { method: 'DELETE' }),
  getUpcoming: () => apiCall<Appointment[]>('/appointments/upcoming'),
};

// ==================== PRESCRIPTION API ====================
export interface Prescription {
  prescription_id: string;
  appointment_id: number;
  doctor_id: string;
  patient_id: string;
  problem: string;
  doctor_notes: string;
  medicines: string;
  pdf_link?: string;
  created_at: string;
}

export const prescriptionApi = {
  getAll: () => apiCall<Prescription[]>('/prescriptions'),
  getById: (id: string) => apiCall<Prescription>(`/prescriptions/${id}`),
  getByPatient: (patientId: string) =>
    apiCall<Prescription[]>(`/prescriptions/patient/${patientId}`),
};

// ==================== MEDICAL RECORD API ====================
export interface MedicalRecord {
  record_id: number;
  patient_id: string;
  doctor_id?: string;
  problem: string;
  status: 'Pending' | 'Ongoing' | 'Resolved' | 'Cancelled';
  description?: string;
  upload_date: string;
}

export const medicalRecordApi = {
  getAll: () => apiCall<MedicalRecord[]>('/medical-records'),
  getById: (id: number) => apiCall<MedicalRecord>(`/medical-records/${id}`),
  getByPatient: (patientId: string) =>
    apiCall<MedicalRecord[]>(`/medical-records/patient/${patientId}`),
};

export default {
  receptionistApi,
  patientApi,
  doctorApi,
  appointmentApi,
  prescriptionApi,
  medicalRecordApi,
};

