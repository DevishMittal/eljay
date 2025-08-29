'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { useRouter } from 'next/navigation';
import { Patient, User } from '@/types';
import { patientService } from '@/services/patientService';
import AddPatientModal from '@/components/modals/add-patient-modal';


export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch patients on component mount and when page changes
  useEffect(() => {
    fetchPatients();
  }, [currentPage]); // fetchPatients is stable, no need to include it

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getPatients(currentPage, 10);
      setPatients(response.patients);
      setTotalPages(response.pagination.totalPages);
      setTotalPatients(response.pagination.total);
    } catch (err) {
      setError('Failed to fetch patients. Please try again.');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    return status === 'New' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
  };

  const getTypeColor = (type: string) => {
    if (!type) return 'bg-gray-100 text-gray-800';
    return type === 'B2B' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  const handlePatientClick = (patientId: string) => {
    router.push(`/patients/${patientId}`);
  };

  const handleAddPatient = () => {
    setShowAddModal(true);
  };

  const handleDeletePatient = async (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientService.deletePatient(patientId);
        fetchPatients(); // Refresh the list
      } catch (err) {
        console.error('Error deleting patient:', err);
        alert('Failed to delete patient. Please try again.');
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading patients...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchPatients}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#101828' }}>Patients</h1>
            <p className="text-sm" style={{ color: '#4A5565' }}>
              {patients.length === 0 ? 'No patients endpoint available yet' : `${patients.length} of ${totalPatients} patients`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              className="px-3 py-2 bg-white text-gray-700 rounded-lg font-medium flex items-center space-x-2 hover:bg-gray-200 transition-colors"
              aria-label="Filter patients"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor ">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              <span>Filter</span>
            </button>
            <button 
              className="px-3 py-2 bg-white text-gray-700 rounded-lg font-medium flex items-center space-x-2 hover:bg-gray-200 transition-colors"
              aria-label="Sort patients"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span>Sort</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button 
                className="p-2 bg-white rounded-md shadow-sm"
                aria-label="List view"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button 
                className="p-2 hover:bg-white rounded-md transition-colors"
                aria-label="Grid view"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
            <button 
              onClick={handleAddPatient}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-orange-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Patient</span>
            </button>
          </div>
        </div>

        {/* Search and Filters - Commented out as requested */}
        {/* <div className="bg-white rounded-lg border border-border p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg "
                  style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
                />
              </div>
            </div>
            <select 
              className="px-3 py-2 border border-border rounded-lg text-sm"
              style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="existing">Existing</option>
            </select>
            <select 
              className="px-3 py-2 border border-border rounded-lg text-sm"
              style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
              aria-label="Filter by type"
            >
              <option value="">All Types</option>
              <option value="b2c">B2C</option>
              <option value="b2b">B2B</option>
            </select>
          </div>
        </div> */}

        {/* Patients Table */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          {patients.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients List Endpoint</h3>
              <p className="text-gray-500 mb-4">
                The patients list requires a GET endpoint at <code className="bg-gray-100 px-2 py-1 rounded">/api/v1/users</code> to fetch all users.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Currently, you can only lookup individual users by phone number or create new patients.
              </p>
              <button 
                onClick={handleAddPatient}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add New Patient
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300" 
                        aria-label="Select all patients"
                        id="select-all-patients"
                      />
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium" style={{ color: '#0A0A0A' }}>Patient</th>
                    <th className="px-4 py-2 text-left text-xs font-medium" style={{ color: '#0A0A0A' }}>Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium" style={{ color: '#0A0A0A' }}>Phone</th>
                    <th className="px-4 py-2 text-left text-xs font-medium" style={{ color: '#0A0A0A' }}>Age</th>
                    <th className="px-4 py-2 text-left text-xs font-medium" style={{ color: '#0A0A0A' }}>Gender</th>
                    <th className="px-4 py-2 text-left text-xs font-medium" style={{ color: '#0A0A0A' }}>Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium" style={{ color: '#0A0A0A' }}>Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium" style={{ color: '#0A0A0A' }}>Last Visit</th>
                    <th className="px-4 py-2 text-left text-xs font-medium" style={{ color: '#0A0A0A' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {patients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handlePatientClick(patient.patient_id)}
                  >
                    <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300" 
                        aria-label={`Select ${patient.full_name}`}
                        id={`select-${patient.id}`}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 font-medium text-xs" style={{ backgroundColor: '#F3F4F6' }}>
                          {getInitials(patient.full_name)}
                        </div>
                        <div>
                          <div className="font-medium text-xs" style={{ color: '#0A0A0A' }}>{patient.full_name}</div>
                          <div className="text-xs" style={{ color: '#717182' }}>{patient.patient_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-xs" style={{ color: '#717182' }}>{patient.email_address}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-xs" style={{ color: '#717182' }}>{patient.mobile_number}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-xs" style={{ color: '#717182' }}>
                        {patient.age || (patient.dob ? patientService.calculateAge(patient.dob) : 'N/A')}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-xs" style={{ color: '#717182' }}>{patient.gender}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(patient.type || '')}`}>
                        {patient.type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(patient.status || '')}`}>
                        {patient.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-xs" style={{ color: '#717182' }}>
                        {patient.last_visited ? patientService.formatDate(patient.last_visited) : 'Never'}
                      </span>
                    </td>
                    <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={(e) => handleDeletePatient(patient.patient_id, e)}
                          className="p-1 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                          aria-label="Delete patient"
                          title="Delete patient"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-xs" style={{ color: '#717182' }}>
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalPatients)} of {totalPatients} patients
            </span>
            <select 
              className="px-2 py-1 border border-border rounded-md text-xs" 
              style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
              aria-label="Items per page"
              id="items-per-page"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs border border-border rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              style={{ color: 'black', backgroundColor: 'white' }}
            >
              &lt; Previous 
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <button 
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    currentPage === pageNum 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-white text-black border border-border hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs border border-border rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              style={{ color: 'black', backgroundColor: 'white' }}
            >
              Next &gt;
            </button>
          </div>
        </div>

        {/* Add Patient Modal */}
        <AddPatientModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchPatients}
        />
      </div>
    </MainLayout>
  );
}
