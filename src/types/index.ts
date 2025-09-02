/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Navigation types
export interface NavItem {
  title: string;
  href?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

export interface NavigationConfig {
  mainNav: NavItem[];
  footerNav: NavItem[];
}

// Component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

// Layout types
export interface HeaderProps extends BaseComponentProps {
  transparent?: boolean;
  sticky?: boolean;
}

export interface FooterProps extends BaseComponentProps {
  showNewsletter?: boolean;
}

// Page metadata types
export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
}

// Animation types
export interface AnimationProps {
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  delay?: number;
  duration?: number;
  ease?: string;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  validation?: any;
  options?: { label: string; value: string }[];
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// SEO types
export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
}

// Utility types
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// API types (for future integration)
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Theme types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  fonts: {
    sans: string;
    mono: string;
  };
  spacing: {
    container: string;
    section: string;
  };
}

// Patient types
export interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  mobile_number: string;
  email_address: string;
  dob?: string;
  gender: 'Male' | 'Female';
  age?: number;
  countrycode?: string;
  type?: string;
  status?: string;
  last_visited?: string;
  alternative_number?: string | null;
  occupation?: string;
  existing_hearing_aid_user?: boolean;
  previous_hearing_aid_model?: string;
  reason_for_visit?: string;
  pre_existing_condition?: string;
  diagnostic_assesment_id?: string;
  branch_id?: string;
  created_by_user_id?: string;
  created_at: string;
  updated_at?: string;
  deleted_date?: string;
}

export interface CreatePatientData {
  full_name: string;
  mobile_number: string;
  email_address: string;
  dob: string;
  gender: 'Male' | 'Female';
  occupation: string;
  address: string;
}

export interface UpdatePatientData {
  full_name?: string;
  mobile_number?: string;
  email_address?: string;
  dob?: string;
  gender?: 'Male' | 'Female';
  occupation?: string;
  alternative_number?: string;
  countrycode?: string;
}

export interface PatientsResponse {
  status: string;
  patients: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PatientResponse {
  status: string;
  patient: Patient;
}

export interface PatientUpdateResponse {
  status: string;
  message: string;
  patient: Patient;
}

// New API User types
export interface User {
  id: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  countrycode: string;
  dob: string;
  gender: string;
  alternateNumber?: string | null;
  occupation: string;
  customerType: string;
  createdAt: string;
  updatedAt: string;
  organization?: {
    id: string;
    name: string;
  };
  appointments?: UserAppointment[];
}

export interface CreateUserData {
  fullname: string;
  email: string;
  countrycode: string;
  phoneNumber: string;
  dob: string;
  gender: string;
  occupation: string;
  customerType: string;
  alternateNumber?: string;
}

export interface UpdateUserData {
  fullname?: string;
  email?: string;
  countrycode?: string;
  phoneNumber?: string;
  dob?: string;
  gender?: string;
  occupation?: string;
  customerType?: string;
  alternateNumber?: string;
}

export interface UsersResponse {
  status: string;
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UserResponse {
  status: string;
  data: User;
}

export interface UserLookupResponse {
  code: number;
  status: string;
  data: User;
}

export interface UserCreateResponse {
  status: string;
  data: User;
}

export interface ReferralSource {
  id?: string;
  type: string;
  sourceName: string;
  contactNumber: string;
  hospital: string;
  specialization: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReferralSourceResponse {
  status: string;
  data: ReferralSource[];
}

export interface UserAppointment {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentDuration: number;
  procedures: string;
  referralSource?: ReferralSource;
  createdAt: string;
  updatedAt: string;
  audiologist: {
    id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
  };
}

export interface UserAppointmentsResponse {
  status: string;
  data: {
    total: number;
    appointments: UserAppointment[];
  };
}

// Appointment types
export interface Appointment {
  id: string;
  audiologistId: string;
  userId: string;
  referralSourceId?: string;
  referralSource?: ReferralSource;
  appointmentDate: string;
  appointmentDuration: number;
  appointmentTime: string;
  procedures: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullname: string;
    email: string;
    phoneNumber: string;
  };
  audiologist: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AppointmentSummary {
  id: string;
  date: string;
  time: string;
  duration: number;
  procedures: string;
  referralSource?: ReferralSource;
  patient: {
    id: string;
    fullname: string;
    email: string;
    phoneNumber: string;
    gender: string;
    customerType: string;
  };
  audiologist: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
}

export interface CreateAppointmentData {
  userId: string;
  audiologistId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentDuration: number;
  procedures: string;
  referralSource?: {
    type: string;
    sourceName: string;
    contactNumber: string;
    hospital: string;
    specialization: string;
  };
  referralSourceId?: string;
}

export interface AppointmentsResponse {
  status: string;
  data: {
    appointments: Appointment[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface AppointmentResponse {
  status: string;
  data: AppointmentSummary;
}

// Audiologist types
export interface Audiologist {
  id: string;
  name: string;
  email: string;
  countrycode: string;
  phoneNumber: string;
  specialization: string;
  organizationId: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AudiologistsResponse {
  status: string;
  data: Audiologist[];
}

// Diagnostic types
export interface Diagnostic {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosticsResponse {
  status: string;
  data: Diagnostic[];
}

export interface DiagnosticResponse {
  status: string;
  data: Diagnostic;
}

export interface CreateDiagnosticData {
  name: string;
  category: string;
  price: number;
  description: string;
}

export interface UpdateDiagnosticData {
  name: string;
  category: string;
  price: number;
  description: string;
}

// Staff types
export interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
  countrycode: string;
  specialization: string;
  permissions: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffResponse {
  status: string;
  data: Staff[];
}

export interface StaffSingleResponse {
  status: string;
  data: Staff;
}

export interface CreateStaffData {
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
  countrycode: string;
  specialization: string;
  permissions: string[];
}

export interface UpdateStaffData {
  role: string;
  specialization: string;
  permissions: string[];
}

// Doctor types
export interface Doctor {
  id: string;
  name: string;
  email: string;
  countrycode: string;
  phoneNumber: string;
  specialization: string;
  organizationId: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  appointments: any[];
}

export interface DoctorsResponse {
  status: string;
  data: Doctor[];
}

export interface DoctorSingleResponse {
  status: string;
  data: Doctor;
}

export interface CreateDoctorData {
  name: string;
  email: string;
  phoneNumber: string;
  countrycode: string;
  specialization: string;
}

export interface UpdateDoctorData {
  specialization: string;
  phoneNumber: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'equipment_maintenance' | 'schedule_appointment' | 'payment_overdue' | 'new_patient_registration' | 'lab_results_ready' | 'task_reminder' | 'system_alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  isRead: boolean;
  isActionRequired: boolean;
  createdAt: Date;
  readAt?: Date;
  relatedEntityId?: string; // ID of related patient, appointment, etc.
  relatedEntityType?: 'patient' | 'appointment' | 'invoice' | 'task' | 'equipment';
  actionUrl?: string; // URL to navigate when clicked
  metadata?: Record<string, any>; // Additional data specific to notification type
}

export interface NotificationStats {
  total: number;
  unread: number;
  actionRequired: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byType: Record<Notification['type'], number>;
}

export interface CreateNotificationData {
  type: Notification['type'];
  priority: Notification['priority'];
  title: string;
  message: string;
  isActionRequired?: boolean;
  relatedEntityId?: string;
  relatedEntityType?: Notification['relatedEntityType'];
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// Breakpoint types
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveValue<T> {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Organization {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  countrycode: string;
  website: string;
  gstNumber: string;
  address: string;
  logo: string;
}

export interface AuthResponse {
  status: string;
  data: {
    token: string;
    refreshToken: string;
    organization: Organization;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  organization: Organization | null;
  loading: boolean;
}

// Procedure type (alias for Diagnostic)
export type Procedure = Diagnostic;

// ProceduresResponse type (alias for DiagnosticsResponse)
export type ProceduresResponse = DiagnosticsResponse;
