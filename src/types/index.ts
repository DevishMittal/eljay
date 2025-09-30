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
  hospital_name?: string; // For B2B patients
  opipNumber?: string; // OP/IP/UHID number for B2B patients
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
  hospital_name?: string; // For B2B patients
  opipNumber?: string; // OP/IP/UHID number for B2B patients
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
  hospitalName?: string; // For B2B patients
  opipNumber?: string; // OP/IP/UHID number for hospital visits
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
  email?: string | null; // Made optional and nullable
  countrycode: string;
  phoneNumber: string;
  dob: string;
  gender: string;
  occupation: string;
  customerType: string;
  alternateNumber?: string | null; // Made nullable
  hospitalName?: string | null; // Made nullable for B2B patients
  opipNumber?: string | null; // Made nullable for OP/IP/UHID number
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
  hospitalName?: string; // For B2B patients
  opipNumber?: string; // OP/IP/UHID number for hospital visits
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
  visitStatus?: 'check_in' | 'cancelled' | 'absent' | null;
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
  audiologistId: string; // deprecated: use staffId going forward
  staffId?: string;
  userId: string;
  visitStatus?: 'check_in' | 'cancelled' | 'absent' | null;
  notes?: string | null;
  referralSourceId?: string;
  referralSource?: ReferralSource;
  appointmentDate: string;
  appointmentDuration: number;
  totalDuration?: string; // Total duration including all procedures (as string from API)
  appointmentTime: string;
  procedures: string;
  hospitalName?: string;
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
  visitStatus?: 'check_in' | 'cancelled' | 'absent' | null;
  notes?: string;
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
  audiologistId?: string; // deprecated
  staffId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentDuration: number;
  totalDuration?: string; // Total duration including all procedures (as string)
  procedures: string;
  hospitalName?: string; // For B2B patients
  referralSource?: {
    type: string;
    sourceName: string;
    contactNumber: string;
    hospital: string;
    specialization: string;
  };
  referralSourceId?: string;
}

export interface UpdateAppointmentData {
  visitStatus?: 'check_in' | 'cancelled' | 'absent';
  notes?: string;
  appointmentDuration?: number;
  appointmentDate?: string;
  appointmentTime?: string;
  procedures?: string;
  audiologistId?: string; // deprecated
  staffId?: string;
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
  name?: string;
  category?: string;
  price?: number;
  description?: string;
}

// Diagnostic Appointment types
export interface DiagnosticAppointment {
  id: string;
  audiologistId: string; // deprecated
  staffId?: string;
  userId: string;
  referralSourceId?: string;
  appointmentDate: string;
  appointmentDuration: number;
  appointmentTime: string;
  procedures: string;
  status: 'planned' | 'completed' | 'cancelled';
  cost?: number;
  assignedDoctor?: string;
  files?: number;
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

export interface DiagnosticAppointmentsResponse {
  status: string;
  data: {
    appointments: DiagnosticAppointment[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface ReferralSourceCreate {
  type: 'doctor' | 'direct' | 'hear.com';
  sourceName: string;
  contactNumber?: string;
  hospital?: string;
  specialization?: string;
}

export interface CreateDiagnosticAppointmentData {
  userId: string;
  audiologistId?: string; // deprecated
  staffId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentDuration: number;
  procedures: string;
  cost: number;
  status: 'planned' | 'completed' | 'cancelled';
  referralSourceId?: string;
  referralSource?: ReferralSourceCreate;
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
  specialization?: string;
  permissions: string[];
}

export interface UpdateStaffData {
  role: string;
  specialization?: string;
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
  qualification?: string | null;
  bdmName?: string | null;
  bdmContact?: string | null;
  commissionRate?: number | null;
  facilityName?: string | null;
  location?: string | null;
  organizationId: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  appointments: any[];
  notes?: string;
  diagnosticProceduresCommission?: string;
  hearingAidsBelow15kCommission?: string;
  hearingAidsBetween15kAnd20kCommission?: string;
  hearingAidsAbove20kCommission?: string;
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
  bdmName?: string;
  bdmContact?: string;
  commissionRate?: number;
  facilityName?: string;
  location?: string;
  notes?: string;
  diagnosticProceduresCommission?: string;
  hearingAidsBelow15kCommission?: string;
  hearingAidsBetween15kAnd20kCommission?: string;
  hearingAidsAbove20kCommission?: string;
}

export interface UpdateDoctorData {
  specialization: string;
  phoneNumber: string;
  bdmName?: string;
  bdmContact?: string;
  commissionRate?: number;
  facilityName?: string;
  location?: string;
  notes?: string;
  diagnosticProceduresCommission?: string;
  hearingAidsBelow15kCommission?: string;
  hearingAidsBetween15kAnd20kCommission?: string;
  hearingAidsAbove20kCommission?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'equipment_maintenance' | 'schedule_appointment' | 'payment_overdue' | 'new_patient_registration' | 'lab_results_ready' | 'task_reminder' | 'system_alert' | 'low_stock' | 'pending_tasks' | 'overdue_payment' | 'todays_appointments' | 'expired_items';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  isRead: boolean;
  isActionRequired: boolean;
  createdAt: Date;
  readAt?: Date;
  relatedEntityId?: string; // ID of related patient, appointment, etc.
  relatedEntityType?: 'patient' | 'appointment' | 'invoice' | 'task' | 'equipment' | 'inventory' | 'payment';
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

// Inventory types
export interface BranchStockDistribution {
  branchName: string;
  branchStock: number;
  status: string;
  lastUpdated: string;
  minimumStock: number;
  maximumStock: number;
  notes?: string | null;
}

export interface BranchStatistics {
  totalBranches: number;
  branchesWithStock: number;
  totalBranchStock: number;
  overallStatus: string[];
}

export interface InventoryItem {
  id: string;
  itemName: string;
  itemCode: string;
  brand: string;
  itemType: string;
  category: string;
  description: string;
  mrp: number;
  color: string;
  formFactor?: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  status: string;
  expiresAt: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  branchStockDistribution?: BranchStockDistribution[];
  branchStatistics?: BranchStatistics;
}

export interface InventoryViewResponse {
  status: string;
  data: {
    items: InventoryItem[];
    view: 'branch' | 'network';
    availableBranches: string[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface InventoryTransaction {
  id: string;
  type: 'addition' | 'consumption';
  quantity: number;
  itemId: string;
  batchNumber?: string;
  expiryDate?: string;
  supplierName?: string;
  supplierContact?: string;
  purchasePrice?: number;
  warranty?: string;
  authorizedBy?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  item: {
    itemName: string;
    itemCode: string;
    brand: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Clinical Notes types
export interface ClinicalNote {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Diagnosis' | 'Treatment' | 'Follow-up' | 'Test Results' | 'Prescription' | 'Referral';
  userId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  referralSourcesId?: string | null;
}

export interface CreateClinicalNoteData {
  title: string;
  content: string;
  category: 'General' | 'Diagnosis' | 'Treatment' | 'Follow-up' | 'Test Results' | 'Prescription' | 'Referral';
}

export interface UpdateClinicalNoteData {
  title?: string;
  content?: string;
  category?: 'General' | 'Diagnosis' | 'Treatment' | 'Follow-up' | 'Test Results' | 'Prescription' | 'Referral';
}

// Procedure type (alias for Diagnostic)
export type Procedure = Diagnostic;

// ProceduresResponse type (alias for DiagnosticsResponse)
export type ProceduresResponse = DiagnosticsResponse;

// Invoice types
export interface InvoiceScreening {
  id?: string;
  invoiceId?: string;
  serialNumber?: number;
  screeningDate: string;
  opNumber: string;
  bioName: string;
  diagnosticName: string;
  amount: number;
  discount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceService {
  id?: string;
  invoiceId?: string;
  serviceName: string;
  description: string;
  quantity: number;
  unitCost: number;
  discount: number;
  total?: number; // This is calculated by the backend
  createdAt?: string;
  updatedAt?: string;
}

export interface OutstandingPayment {
  id: string;
  receiptNumber: string;
  paymentMethod: string;
  description: string;
  date: string;
  availableAmount: number;
  originalAmount: number;
  appliedAmount: number;
}

export interface OutstandingPaymentsResponse {
  status: string;
  data: {
    patient: {
      id: string;
      name: string;
      phoneNumber: string;
    };
    outstandingPayments: OutstandingPayment[];
    totalOutstanding: number;
    count: number;
  };
}

export interface AppliedAdvancePayment {
  paymentId: string;
  appliedAmount: number;
}

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

export interface Invoice {
  id: string;
  invoiceNumber: string;
  organizationId: string;
  invoiceDate: string;
  patientName: string;
  patientId?: string;
  organizationName?: string;
  invoiceType: 'B2B' | 'B2C';
  paymentStatus: 'Pending' | 'Paid' | 'Cancelled' | 'Partially Paid';
  overallDiscount?: number;
  sgstRate: number;
  cgstRate: number;
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  sgstAmount: number;
  cgstAmount: number;
  totalTax: number;
  totalAmount: number;
  notes?: string;
  warranty?: string;
  createdAt: string;
  updatedAt: string;
  screenings: InvoiceScreening[];
  services: InvoiceService[];
  appliedAdvancePayments?: AppliedAdvancePayment[];
}

export interface CreateInvoiceData {
  invoiceDate: string;
  patientName: string;
  patientId?: string;
  organizationName?: string;
  invoiceType: 'B2B' | 'B2C';
  screenings?: InvoiceScreening[];
  services?: Omit<InvoiceService, 'id' | 'invoiceId' | 'total' | 'createdAt' | 'updatedAt'>[];
  overallDiscount?: number;
  paymentStatus: 'Pending' | 'Paid' | 'Cancelled' | 'Partially Paid';
  sgstRate: number;
  cgstRate: number;
  notes?: string;
  warranty?: string;
  appliedAdvancePayments?: AppliedAdvancePayment[];
}

export interface UpdateInvoiceData {
  invoiceDate?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Cancelled' | 'Partially Paid';
  sgstRate?: number;
  cgstRate?: number;
  screenings?: InvoiceScreening[];
}

export interface InvoicesResponse {
  status: string;
  data: {
    invoices: Invoice[];
    summary: {
      totalAmount: number;
      totalTax: number;
      count: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface InvoiceResponse {
  status: string;
  data: Invoice;
}

// Payment types
export interface Payment {
  id: string;
  receiptNumber: string;
  organizationId: string;
  paymentDate: string;
  patientName: string;
  patientId?: string | null; // Required for advance payments
  amount: number;
  method: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Cheque';
  status: 'Pending' | 'Completed' | 'Failed' | 'Cancelled';
  transactionId?: string | null;
  receivedBy?: string | null;
  paymentType: 'Full' | 'Advance'; // Updated from 'Partial' to 'Advance'
  description?: string | null;
  notes?: string | null;
  appliedAmount: number;
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentData {
  paymentDate: string;
  patientName: string;
  patientId?: string; // Required for advance payments
  amount: number;
  method: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Cheque';
  status: 'Pending' | 'Completed' | 'Failed' | 'Cancelled';
  transactionId?: string;
  receivedBy?: string;
  paymentType: 'Full' | 'Advance'; // Updated from 'Partial' to 'Advance'
  description?: string;
  notes?: string;
}

export interface UpdatePaymentData {
  paymentDate?: string;
  amount?: number;
  method?: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Cheque';
  status?: 'Pending' | 'Completed' | 'Failed' | 'Cancelled';
  transactionId?: string;
  receivedBy?: string;
  paymentType?: 'Full' | 'Advance'; // Updated from 'Partial' to 'Advance'
  description?: string;
  notes?: string;
}

export interface PaymentsResponse {
  status: string;
  data: {
    payments: Payment[];
    summary: {
      totalAmount: number;
      count: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface PaymentResponse {
  status: string;
  data: Payment;
}

// Outstanding Payment types
export interface OutstandingPayment {
  id: string;
  receiptNumber: string;
  paymentMethod: string;
  description: string;
  date: string;
  availableAmount: number;
  originalAmount: number;
  appliedAmount: number;
}

export interface OutstandingPaymentsResponse {
  status: string;
  data: {
    patient: {
      id: string;
      name: string;
      phoneNumber: string;
    };
    outstandingPayments: OutstandingPayment[];
    totalOutstanding: number;
    count: number;
  };
}

// Expense types
export interface Expense {
  id: string;
  expenseNumber: string;
  organizationId: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: 'Cash' | 'Card' | 'Credit Card' | 'Cheque' | 'Bank Transfer';
  vendor: string;
  approvedBy: string | null;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  date: string;
  category: string;
  description: string;
  amount: number;
  taxAmount: number;
  paymentMethod: 'Cash' | 'Card' | 'Credit Card' | 'Cheque' | 'Bank Transfer';
  vendor: string;
  remarks?: string;
}

export interface UpdateExpenseData {
  date?: string;
  category?: string;
  description?: string;
  amount?: number;
  taxAmount?: number;
  paymentMethod?: 'Cash' | 'Card' | 'Credit Card' | 'Cheque' | 'Bank Transfer';
  vendor?: string;
  approvedBy?: string;
  remarks?: string;
}

export interface ExpensesResponse {
  status: string;
  data: {
    expenses: Expense[];
    summary: {
      totalAmount: number;
      totalTax: number;
      count: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface ExpenseResponse {
  status: string;
  data: Expense;
}

// Inventory Transfer types
export interface TransferItem {
  id: string;
  transferId: string;
  inventoryItemId: string;
  quantity: number;
  condition: string;
  color: string;
  itemRemarks: string;
  createdAt: string;
  updatedAt: string;
  inventoryItem: {
    id: string;
    itemName: string;
    itemCode: string;
    brand: string;
    mrp?: number;
    currentStock?: number;
  };
}

export interface InventoryTransfer {
  notes: string;
  id: string;
  organizationId: string;
  transferType: "Internal" | "Branch" | "Repair" | "External";
  urgencyLevel: "Low" | "Medium" | "High" | "Critical";
  fromLocation: string;
  toLocation: string;
  trackingNumber: string;
  shippingCost: number;
  transferredDate: string;
  transferredBy: string;
  additionalNotes: string;
  status: "Pending" | "In Transit" | "Delivered" | "Cancelled";
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  transferItems: TransferItem[];
  organization?: {
    id: string;
    name: string;
  };
}

export interface CreateTransferData {
  transferType: "Internal" | "Branch" | "Repair" | "External";
  urgencyLevel: "Low" | "Medium" | "High" | "Critical";
  fromLocation: string;
  toLocation: string;
  trackingNumber: string;
  shippingCost: number;
  transferredDate: string;
  transferredBy: string;
  additionalNotes: string;
  transferItems: {
    inventoryItemId: string;
    quantity: number;
    condition: string;
    color: string;
    itemRemarks: string;
  }[];
}

export interface TransfersResponse {
  status: string;
  data: {
    transfers: InventoryTransfer[];
    summary: {
      total: number;
      pending: number;
      inTransit: number;
      delivered: number;
      cancelled: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface TransferResponse {
  status: string;
  data: InventoryTransfer;
}

// Hospital types
export interface Hospital {
  id: string;
  name: string;
  primaryContact: string;
  address: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalsResponse {
  status: string;
  data: {
    hospitals: Hospital[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface HospitalResponse {
  status: string;
  data: Hospital;
}

export interface CreateHospitalData {
  name: string;
  primaryContact: string;
  address: string;
  phoneNumber: string;
}

export interface UpdateHospitalData {
  name?: string;
  primaryContact?: string;
  address?: string;
  phoneNumber?: string;
}

// Branch types
export interface Branch {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  managerName: string;
  status: 'Active' | 'Inactive' | string;
  notes?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BranchesResponse {
  status: string;
  data: {
    branches: Branch[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface BranchResponse {
  status: string;
  data: Branch;
}

export interface CreateBranchData {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  managerName: string;
  status: 'Active' | 'Inactive' | string;
  notes?: string;
}

export interface UpdateBranchData {
  name?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  managerName?: string;
  status?: 'Active' | 'Inactive' | string;
  notes?: string;
}

// Print Settings Types
export interface PrintPageSettings {
  paperSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation: 'Portrait' | 'Landscape';
  printerType: 'Color' | 'Black';
  margins: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
}

export interface PrintHeaderSettings {
  includeHeader: boolean;
  leftText: string;
  rightText: string;
  logo: {
    uploaded: boolean;
    type: 'Square' | 'Narrow' | 'Wide';
    alignment: 'Left' | 'Centre' | 'Right';
  };
}

export interface PrintFooterSettings {
  topMargin: number;
  fullWidthContent: string[];
  leftSignature: {
    name: string;
    title: string;
    organization: string;
  };
  rightSignature: {
    name: string;
    title: string;
    organization: string;
    date: string;
  };
  thankYouMessage: string;
  signatureNote: string;
}

export interface PrintSettings {
  b2cInvoice: {
    pageSettings: PrintPageSettings;
    headerSettings: PrintHeaderSettings;
    footerSettings: PrintFooterSettings;
  };
  b2bInvoice: {
    pageSettings: PrintPageSettings;
    headerSettings: PrintHeaderSettings;
    footerSettings: PrintFooterSettings;
  };
  payments: {
    pageSettings: PrintPageSettings;
    headerSettings: PrintHeaderSettings;
    footerSettings: PrintFooterSettings;
  };
  expenses: {
    pageSettings: PrintPageSettings;
    headerSettings: PrintHeaderSettings;
    footerSettings: PrintFooterSettings;
  };
  transfers: {
    pageSettings: PrintPageSettings;
    headerSettings: PrintHeaderSettings;
    footerSettings: PrintFooterSettings;
  };
}