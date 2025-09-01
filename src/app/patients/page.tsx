'use client';

import { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { useRouter } from 'next/navigation';
import { Patient } from '@/types';
import { patientService } from '@/services/patientService';
import CustomDropdown from '@/components/ui/custom-dropdown';
import WalkInAppointmentModal from '@/components/modals/walk-in-appointment-modal';



export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  
  // Filter, Sort, and View state
  const [classification, setClassification] = useState('');
  const [gender, setGender] = useState('');
  const [patientStatus, setPatientStatus] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);


  const fetchPatients = useCallback(async () => {
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
  }, [currentPage]);

  // Fetch patients on component mount and when page changes
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.relative')) {
        setShowFilters(false);
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    router.push('/patients/add');
  };

  const handleBookAppointment = () => {
    setShowAppointmentModal(true);
  };

  const handleCloseAppointmentModal = () => {
    setShowAppointmentModal(false);
  };

  const handleAppointmentCreated = (appointment: { id: string; date: Date; time: string; patient: string; type: string; duration: number; audiologist: string; notes: string; phoneNumber: string; email: string }) => {
    console.log('Appointment created:', appointment);
    setShowAppointmentModal(false);
    // Refresh the patients list to show any updates
    fetchPatients();
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

  // Filter and sort functions
  const getFilteredAndSortedPatients = () => {
    let filteredPatients = [...patients];

    // Apply filters
    if (classification) {
      filteredPatients = filteredPatients.filter(patient => patient.type === classification);
    }
    if (gender) {
      filteredPatients = filteredPatients.filter(patient => patient.gender === gender);
    }
    if (patientStatus) {
      filteredPatients = filteredPatients.filter(patient => patient.status === patientStatus);
    }

    // Apply sorting
    if (sortBy) {
      filteredPatients.sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';

        switch (sortBy) {
          case 'name':
            aValue = a.full_name.toLowerCase();
            bValue = b.full_name.toLowerCase();
            break;
          case 'email':
            aValue = a.email_address.toLowerCase();
            bValue = b.email_address.toLowerCase();
            break;
          case 'age':
            aValue = a.age || (a.dob ? patientService.calculateAge(a.dob) : 0);
            bValue = b.age || (b.dob ? patientService.calculateAge(b.dob) : 0);
            break;
          case 'dateAdded':
            aValue = new Date(a.created_at || '').getTime();
            bValue = new Date(b.created_at || '').getTime();
            break;
          case 'lastVisit':
            aValue = new Date(a.last_visited || '1970-01-01').getTime();
            bValue = new Date(b.last_visited || '1970-01-01').getTime();
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return sortOrder === 'asc' 
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
        }
      });
    }

    return filteredPatients;
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setShowSortMenu(false);
  };

  const clearFilters = () => {
    setClassification('');
    setGender('');
    setPatientStatus('');
  };

  const displayedPatients = getFilteredAndSortedPatients();

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
    <MainLayout className="!p-0 !pt-2.5">
      <div className=" flex flex-col h-full">
        <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between !px-3">
          <div>
            <h1 className="text-lg font-medium" style={{ color: '#101828' }}>Patients</h1>
          
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`border text-xs px-3 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors ${
                  showFilters || classification || gender || patientStatus
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Filter patients"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                <span>Filter</span>
                {(classification || gender || patientStatus) && (
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                )}
              </button>
              
              {showFilters && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-50 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">Filter Patients</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Close filters"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Classification</label>
                      <CustomDropdown
                        options={[
                          { value: '', label: 'All Types' },
                          { value: 'B2C', label: 'B2C' },
                          { value: 'B2B', label: 'B2B' }
                        ]}
                        value={classification}
                        onChange={setClassification}
                        placeholder="All Types"
                        aria-label="Filter by classification"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                      <CustomDropdown
                        options={[
                          { value: '', label: 'All Genders' },
                          { value: 'Male', label: 'Male' },
                          { value: 'Female', label: 'Female' }
                        ]}
                        value={gender}
                        onChange={setGender}
                        placeholder="All Genders"
                        aria-label="Filter by gender"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Patient Status</label>
                      <CustomDropdown
                        options={[
                          { value: '', label: 'All Patients' },
                          { value: 'New', label: 'New' },
                          { value: 'Existing', label: 'Existing' }
                        ]}
                        value={patientStatus}
                        onChange={setPatientStatus}
                        placeholder="All Patients"
                        aria-label="Filter by patient status"
                      />
                    </div>
                    
                    {(classification || gender || patientStatus) && (
                      <div className="pt-2 border-t border-gray-200">
                        <button
                          onClick={clearFilters}
                          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className={`border text-xs px-3 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors ${
                  sortBy ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Sort patients"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <span>Sort</span>
                <svg className={`w-3 h-3 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {sortBy && (
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                )}
              </button>
              
              {showSortMenu && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50 p-2">
                  <div className="mb-2 px-3 py-2">
                    <h3 className="font-medium text-gray-900 text-xs">Sort by</h3>
                  </div>
                  
                  {[
                    { key: 'name', label: 'Name (A-Z)', icon: '↕' },
                    { key: 'email', label: 'Email', icon: '' },
                    { key: 'age', label: 'Age', icon: '' },
                    { key: 'dateAdded', label: 'Date Added', icon: '' },
                    { key: 'lastVisit', label: 'Last Visit', icon: '' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleSortChange(option.key)}
                      className={`w-full text-left px-3 py-2 text-xs rounded-md hover:bg-gray-100 transition-colors flex items-center justify-between ${
                        sortBy === option.key ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">{option.icon}</span>
                        <span>{option.label}</span>
                      </div>
                      {sortBy === option.key && (
                        <svg className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`text-sm p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white'
                }`}
                aria-label="List view"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`text-xs p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white'
                }`}
                aria-label="Grid view"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
            <button 
              onClick={handleAddPatient}
              className="text-xs bg-orange-500 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-orange-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Patient</span>
            </button>
            <button 
              onClick={handleBookAppointment}
              className="text-xs bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-blue-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Book Appointment</span>
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

        {/* Patients Display */}
        <div className="bg-white rounded-lg overflow-hidden !p-0">
          {displayedPatients.length === 0 && patients.length > 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients match your filters</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters to see more patients.
              </p>
              <button 
                onClick={clearFilters}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : displayedPatients.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Found</h3>
              <p className="text-gray-500 mb-6">
                No patients have been registered yet. Add your first patient to get started.
              </p>
              <button 
                onClick={handleAddPatient}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add New Patient
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
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
                <tbody className="">
                  {displayedPatients.map((patient) => (
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
          ) : (
            // Grid View
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {displayedPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientClick(patient.patient_id)}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-orange-200"
                  >
                    {/* Patient Avatar and Info */}
                    <div className="flex flex-col items-center text-center mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm mb-2" style={{ backgroundColor: '#F3F4F6' }}>
                        {getInitials(patient.full_name)}
                      </div>
                      <h3 className="font-medium text-sm text-gray-900 mb-1 truncate w-full">{patient.full_name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{patient.patient_id}</p>
                      
                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-1 justify-center mb-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(patient.type || '')}`}>
                          {patient.type || 'B2C'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(patient.status || '')}`}>
                          {patient.status || 'New'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{patient.email_address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{patient.mobile_number}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{patient.gender}, {patient.age || (patient.dob ? patientService.calculateAge(patient.dob) : 'N/A')} years</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Last: {patient.last_visited ? patientService.formatDate(patient.last_visited) : 'Never'}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center">
                      <button 
                        onClick={(e) => handleDeletePatient(patient.patient_id, e)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                        aria-label="Delete patient"
                        title="Delete patient"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Pagination Footer - Sticky to bottom */}
        <div className="bg-white mt-auto !p-1  !border-t ">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xs" style={{ color: '#717182' }}>
                Showing {displayedPatients.length} of {patients.length} patients
                {(classification || gender || patientStatus) && ' (filtered)'}
              </span>
              <select 
                className="px-2 !py-1 border border-border rounded-md text-xs" 
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
        </div>
      </div>

      {/* Walk-in Appointment Modal */}
      <WalkInAppointmentModal
        isOpen={showAppointmentModal}
        onClose={handleCloseAppointmentModal}
        onAppointmentCreated={handleAppointmentCreated}
      />
    </MainLayout>
  );
}
