# Eljay - Hearing Care Management System

## Project Overview

**Eljay** is a comprehensive, production-ready Hearing Care Management System built with Next.js 15+ and TypeScript. The system provides a complete solution for audiologists and healthcare professionals to manage appointments, patients, billing, inventory, and practice operations with advanced analytics and patient management capabilities.

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Styling**: Tailwind CSS v4 (pre-configured, no separate config file)
- **Language**: TypeScript (strict mode)
- **Runtime**: React 19.1.0
- **Charts**: Recharts (comprehensive charting library)
- **Animations**: Framer Motion
- **Forms**: React Hook Form, Zod, `@hookform/resolvers`
- **Utility**: `clsx` for class name merging, `lucide-react` for icons
- **Font**: Segoe UI (system-wide)
- **Backend API**: `https://eljay-api.vizdale.com/api/v1`

## Current Architecture

### Authentication System
- **JWT-based authentication** with Bearer tokens
- **Middleware protection** for route security
- **Organization-based login** system
- **Context providers** for Auth, Notifications, and Tasks
- **localStorage and cookie management** for session persistence
- **Route protection** with automatic redirects

### Application Structure
```
src/
├── app/
│   ├── layout.tsx                  # Root layout with metadata and providers
│   ├── page.tsx                    # Redirects to /login
│   ├── globals.css                 # Global styles with Tailwind v4
│   ├── middleware.ts               # Route protection middleware
│   ├── login/
│   │   └── page.tsx                # Login page with organization auth
│   └── (authenticated)/
│       ├── layout.tsx              # Protected route wrapper
│       ├── appointments/
│       │   └── page.tsx            # Dynamic calendar with full CRUD
│       ├── dashboard/
│       │   └── page.tsx            # Analytics dashboard with Recharts
│       ├── patients/
│       │   ├── page.tsx            # Patient listing with search/filters
│       │   ├── add/
│       │   │   └── page.tsx        # Add new patient form
│       │   └── [id]/
│       │       ├── page.tsx        # Patient profile
│       │       ├── oae/
│       │       ├── hat/
│       │       └── diagnostics/
│       ├── doctor-referrals/
│       │   └── page.tsx            # Doctor management
│       ├── billing/
│       │   ├── invoices/
│       │   ├── payments/
│       │   └── expenses/
│       ├── inventory/
│       │   ├── page.tsx            # Stock overview
│       │   ├── adjustments/
│       │   └── transfer/
│       └── settings/
│           ├── doctors/
│           ├── staff/
│           ├── hospitals/
│           └── diagnostics/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx      # Route protection component
│   ├── layout/
│   │   ├── header.tsx              # Header with search and profile
│   │   ├── sidebar.tsx             # Navigation sidebar with icons
│   │   ├── main-layout.tsx         # Main layout wrapper
│   │   └── tasks-analytics.tsx     # Tasks & Analytics sidebar
│   ├── calendar/
│   │   └── dynamic-calendar.tsx    # Advanced calendar with CRUD operations
│   ├── modals/
│   │   ├── walk-in-appointment-modal.tsx  # 7-stage appointment creation
│   │   ├── edit-appointment-modal.tsx     # Appointment editing
│   │   ├── add-doctor-modal.tsx           # Shared doctor creation
│   │   ├── add-patient-modal.tsx          # Patient creation
│   │   └── [various modals]
│   └── ui/
│       ├── button.tsx              # Reusable button variants
│       ├── card.tsx                # Card components
│       ├── input.tsx               # Input with validation
│       └── custom-dropdown.tsx     # Dropdown component
├── contexts/
│   ├── AuthContext.tsx             # Authentication state management
│   ├── NotificationContext.tsx     # Notification system
│   └── TaskContext.tsx             # Task management
├── services/
│   ├── authService.ts              # Authentication API calls
│   ├── appointmentService.ts       # Appointment management
│   ├── patientService.ts           # Patient operations
│   ├── doctorService.ts            # Doctor management
│   ├── dashboardService.ts         # Analytics data
│   ├── inventoryService.ts         # Inventory operations
│   └── [various services]          # Other API services
├── types/
│   └── index.ts                    # Comprehensive TypeScript definitions
└── utils/
    ├── index.ts                    # Utility functions
    └── calendar.ts                 # Calendar utilities
```

## Current Implementation Status

### ✅ Fully Implemented Features

#### 1. Authentication & Security
- **Organization-based login system** with JWT tokens
- **Route protection middleware** with automatic redirects
- **Session management** with localStorage and cookies
- **Context-based auth state** management
- **Protected route wrapper** for authenticated pages

#### 2. Appointments Management
- **Dynamic calendar** with day/week/month views (8:00 AM - 8:00 PM)
- **7-stage walk-in appointment modal** with comprehensive form validation
- **Appointment editing** with modal interface
- **Status management**: check-in, absent, no-show with reason/notes
- **Notes management** with real-time updates
- **Patient lookup** by phone number
- **Audiologist assignment** with availability checking
- **Procedure selection** with duration calculation
- **Referral source tracking** (Direct, Doctor, Hospital)

#### 3. Patient Management
- **Complete CRUD operations** for patient records
- **User lookup API integration** with phone number validation
- **Patient profiles** with comprehensive data management
- **B2B and B2C patient types** support
- **Medical history integration** with timeline view
- **File upload capabilities** for patient documents
- **EMR system integration** with diagnostics
- **OAE and HAT form management**

#### 4. Doctor/Audiologist Management
- **Shared modal component** for doctor creation across pages
- **Specialization restrictions**: ENT, Neurology, Pediatrician, General Medicine, Others ✅
- **Commission rate management** with validation
- **BDM contact handling** (optional field) ✅
- **Country code restriction** to +91 (India) ✅
- **Facility/hospital association**
- **Availability tracking**

#### 5. Dashboard & Analytics
- **Recharts integration** with multiple chart types
- **Comprehensive metrics** display
- **Time-based filtering** (7 days, 30 days, 90 days, 1 year)
- **Interactive charts** with tooltips and legends
- **Multiple dashboard tabs**: Appointments, Doctor Referral, Diagnostics, Hearing Aid, Billings, Inventory
- **Responsive design** for different screen sizes

#### 6. Billing System
- **Invoice management** (B2B and B2C)
- **Payment processing** with multiple payment methods
- **Expense tracking** with categorization
- **Outstanding payments** monitoring
- **GST calculations** and management
- **Payment history** tracking

#### 7. Inventory Management
- **Stock overview** with branch-level tracking
- **Inventory transfers** between branches
- **Stock adjustments** with reason tracking
- **Low stock alerts** and notifications
- **Batch/serial number tracking**
- **Supplier management**

#### 8. Settings Management
- **Hospital management** with CRUD operations
- **Staff management** with role-based permissions
- **Diagnostics configuration** with pricing
- **Organization profile** management
- **System preferences** and configurations

### 🔄 Backend Integration Status
- **API Base URL**: `https://eljay-api.vizdale.com/api/v1`
- **Authentication endpoints**: ✅ Working
- **Appointment management**: ✅ Working
- **Patient/User management**: ✅ Working
- **Doctor/Audiologist APIs**: ✅ Working
- **Inventory APIs**: ✅ Working
- **Billing APIs**: ✅ Working
- **File upload**: ✅ Working
- **Dashboard analytics**: ✅ Working

## Design System

### Colors
- **Primary**: `#f97316` (Orange for brand)
- **Accent**: `#3b82f6` (Blue for accents)
- **Dashboard Colors**:
  - **Headers**: `#101828` (600, semibold)
  - **Subheadings**: `#4A5565` (400, regular)
  - **Input Titles**: `#0A0A0A` (600, semibold)
  - **Placeholder Background**: `#F3F3F5`
  - **Placeholder Text**: `#717182` (400, regular)
  - **Active Links**: `#101828` (Semibold)
  - **Inactive Links**: `#717182` (Regular)
- **Search Bar**: 
  - Background: `#F9FAFB`
  - Border: `#E5E7EB`
  - Placeholder: `#717182`
- **Typography**:
  - Active links: `#101828` (Semibold)
  - Profile text: `#101828` (name), `#667085` (designation)

### Typography
- **Font Family**: Segoe UI throughout the application
- **Active Navigation**: Font-weight 600 (Semibold)
- **Inactive Navigation**: Font-weight 400 (Regular)
- **Dashboard Headers**: Font-weight 600 (Semibold)
- **Dashboard Subheadings**: Font-weight 400 (Regular)

## Major Components

### 1. Authentication System
- **Login Page**: Organization-based authentication with proper validation
- **Protected Routes**: Middleware-based route protection
- **Auth Context**: Centralized authentication state management
- **Session Management**: Automatic token refresh and logout

### 2. Dynamic Calendar System
- **Multi-view Support**: Day, Week, Month views
- **Time Slot Management**: 8:00 AM - 8:00 PM with 30-minute slots
- **Appointment CRUD**: Full create, read, update, delete operations
- **Status Management**: Check-in, absent, no-show with detailed reasoning
- **Real-time Updates**: Live appointment data synchronization

### 3. Patient Management System
- **Comprehensive Profiles**: Complete patient information management
- **B2B/B2C Support**: Different patient types with specific fields
- **EMR Integration**: Electronic medical records with diagnostics
- **File Management**: Document upload and organization
- **Medical History**: Timeline-based medical history tracking

### 4. Doctor/Audiologist Management
- **Shared Components**: Reusable doctor creation modal
- **Specialization Management**: Predefined specialization categories
- **Commission Tracking**: Commission rate management
- **Facility Association**: Hospital/clinic connections
- **Referral Management**: Doctor referral tracking

### 5. Advanced Dashboard
- **Multiple Tabs**: Appointments, Doctor Referral, Diagnostics, Hearing Aid, Billings, Inventory
- **Interactive Charts**: Recharts integration with tooltips and legends
- **Time Filtering**: Configurable date range selection
- **Real-time Metrics**: Live performance indicators

### 6. Comprehensive Billing
- **Invoice Management**: B2B and B2C invoice creation and management
- **Payment Processing**: Multiple payment methods and tracking
- **Expense Management**: Detailed expense categorization and tracking
- **GST Handling**: Automatic tax calculations
- **Outstanding Payments**: Overdue payment monitoring

### 7. Inventory Management
- **Multi-branch Support**: Branch-level stock tracking
- **Transfer Management**: Inter-branch inventory transfers
- **Stock Adjustments**: Inventory level adjustments with reasoning
- **Low Stock Alerts**: Automated notification system
- **Supplier Management**: Vendor information and tracking

## Key Features Already Implemented ✅

### Doctor Management Section ✅
1. **Specialization Options**: ENT, Neurology, Pediatrician (top 3), General Medicine, Others ✅
2. **BDM Contact**: Made optional with proper validation ✅
3. **Country Code**: Restricted to +91 (India) across all modals ✅
4. **Shared Modal**: AddDoctorModal used across multiple pages ✅
5. **API Integration**: Fixed doctor creation functionality ✅

### Appointment System ✅
1. **Dynamic Calendar**: Day/Week/Month views with proper time slots ✅
2. **Appointment Editing**: Full edit functionality with modals ✅
3. **Status Management**: Check-in, absent, no-show with reason/notes ✅
4. **Time Extension**: Calendar extended to 8:00 PM (20:00) ✅
5. **Notes Management**: Real-time notes updates ✅

### Authentication & Navigation ✅
1. **JWT Authentication**: Complete login/logout system ✅
2. **Route Protection**: Middleware-based security ✅
3. **Session Management**: localStorage and cookie handling ✅
4. **Protected Routes**: Automatic redirect system ✅

## Pending Feature Development 🔄

Based on the comprehensive change list provided, the following sections need attention:

### Doctor Management Enhancements
- Commission rate splitting (Diagnostic vs Hearing Aid)
- Doctor notes display in appointment booking
- Enhanced doctor selection with notes

### Appointment System Improvements
- Email field made optional
- B2B patient referral source restrictions
- Enhanced appointment summary duration display

### Billing System Enhancements
- GST default to 0% with discount field removal
- B2C advance payment improvements
- Payment method validation enhancements
- Manual unit cost override

### Patient Management (EMR)
- Diagnostic appointment history integration
- File view fixes in diagnostics section
- OP/IP/UHID number fields for B2B patients

### Inventory System Updates
- Color field additions to items and stock
- Serial number field renaming
- Form factor field additions
- Automated inventory consumption

### OAE Form Improvements
- Staff field label changes
- Doctor data source updates
- Equipment field removal

### Dashboard Enhancements
- No data illustrations
- Enhanced filtering systems

### Settings Improvements
- Logo addition to profile
- Hospital management fixes

## Development Workflow

### Current State
- **Production-ready codebase** with comprehensive features
- **Full TypeScript implementation** with strict typing
- **Modern React patterns** with hooks and context
- **Responsive design** with Tailwind CSS v4
- **Comprehensive API integration** with error handling
- **Performance optimized** with Next.js 15+ features

### Next Development Phase
The system is ready for incremental feature development based on the provided change list. Each section can be tackled independently while maintaining the existing architecture and design patterns.

---

*This system represents a mature, production-ready hearing care management platform with comprehensive functionality across all major operational areas. The codebase follows modern development practices and is well-structured for ongoing development and maintenance.*
