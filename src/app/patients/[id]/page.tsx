import type { Metadata } from 'next';
import MainLayout from '@/components/layout/main-layout';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Patient Profile',
  description: 'Patient profile and medical records.',
  keywords: ['patient', 'profile', 'medical records', 'healthcare'],
};

export default function PatientProfilePage({ params }: { params: { id: string } }) {
  const patient = {
    id: 'PAT008',
    name: 'Anna Rodriguez',
    email: 'anna.rodriguez@email.com',
    phone: '+1 234 567 8907',
    age: 30,
    gender: 'Female',
    type: 'B2C',
    status: 'New',
    dateOfBirth: '18/2/1995',
    occupation: 'Graphic Designer',
    address: 'Not provided',
    lastUpdated: '5/6/2025'
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/patients" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-medium text-lg">
                {getInitials(patient.name)}
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#101828' }}>{patient.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{patient.type}</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{patient.status}</span>
                </div>
                <p className="text-sm mt-1" style={{ color: '#4A5565' }}>
                  Patient ID: {patient.id} • Last updated: {patient.lastUpdated}
                </p>
              </div>
            </div>
          </div>
          <button className="flex items-center space-x-2 text-sm" style={{ color: '#717182' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            <span>Options</span>
          </button>
        </div>

        {/* Patient Navigation */}
        <div className="bg-white rounded-lg border border-border p-4">
          <nav className="flex space-x-8">
            <button className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border-l-4 border-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium" style={{ color: '#101828' }}>Profile</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span style={{ color: '#717182' }}>EMR</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span style={{ color: '#717182' }}>Billing</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>

        {/* Profile Sub-navigation */}
        <div className="bg-white rounded-lg border border-border p-4">
          <nav className="flex space-x-6">
            <button className="px-3 py-2 bg-blue-50 rounded-lg font-medium" style={{ color: '#101828' }}>
              Patient Information
            </button>
            <button className="px-3 py-2 hover:bg-muted rounded-lg transition-colors" style={{ color: '#717182' }}>
              Appointment History
            </button>
          </nav>
        </div>

        {/* Patient Information */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Patient Information</h2>
            </div>
            <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span style={{ color: '#717182' }}>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="font-semibold" style={{ color: '#0A0A0A' }}>Personal Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#0A0A0A' }}>Full Name *</label>
                  <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: '#F3F3F5', color: '#717182' }}>
                    {patient.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#0A0A0A' }}>Date of Birth</label>
                  <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: '#F3F3F5', color: '#717182' }}>
                    {patient.dateOfBirth} ({patient.age} years)
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#0A0A0A' }}>Gender</label>
                  <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: '#F3F3F5', color: '#717182' }}>
                    {patient.gender}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#0A0A0A' }}>Occupation</label>
                  <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: '#F3F3F5', color: '#717182' }}>
                    {patient.occupation}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold" style={{ color: '#0A0A0A' }}>Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#0A0A0A' }}>Mobile Number *</label>
                  <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: '#F3F3F5', color: '#717182' }}>
                    {patient.phone}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#0A0A0A' }}>Email Address</label>
                  <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: '#F3F3F5', color: '#717182' }}>
                    {patient.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#0A0A0A' }}>Address</label>
                  <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: '#F3F3F5', color: '#717182' }}>
                    {patient.address}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment History */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Appointment History</h2>
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-primary/90 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Appointment</span>
            </button>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: '#101828' }}>No appointments yet</h3>
            <p className="text-sm mb-6" style={{ color: '#4A5565' }}>Schedule the first appointment for this patient.</p>
            <button className="bg-primary text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto hover:bg-primary/90 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Book First Appointment</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
