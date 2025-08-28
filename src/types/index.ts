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
  address?: string;
  city?: string;
  pincode?: string;
  type?: string;
  status?: string;
  last_visited?: string;
  alternative_number?: string;
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

export interface UpdatePatientData extends Partial<CreatePatientData> {}

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
