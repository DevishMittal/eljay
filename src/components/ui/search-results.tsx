'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SearchResult } from '@/services/searchService';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  isVisible: boolean;
  onClose: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
  isVisible,
  onClose
}) => {
  const router = useRouter();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTypeColor = (type?: string) => {
    if (!type) return 'bg-gray-100 text-gray-800';
    return type === 'B2B' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    return status === 'New' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
  };

  const handlePatientClick = (patientId: string) => {
    router.push(`/patients/${patientId}`);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto">
      {isLoading ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-xs text-gray-500 mt-2">Searching...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="p-4 text-center">
          <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500">No patients found</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="py-2">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
            {results.length} patient{results.length !== 1 ? 's' : ''} found
          </div>
          {results.map((patient) => (
            <div
              key={patient.id}
              onClick={() => handlePatientClick(patient.patient_id)}
              className="flex items-center space-x-3 px-3 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0"
            >
              {/* Patient Avatar */}
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-gray-700">
                  {getInitials(patient.full_name)}
                </span>
              </div>
              
              {/* Patient Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {patient.full_name}
                  </h4>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(patient.type)}`}>
                    {patient.type || 'B2C'}
                  </span>
                  {patient.status && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{patient.mobile_number}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{patient.gender}</span>
                    {patient.age && <span>, {patient.age}y</span>}
                  </div>
                </div>
                
                {patient.hospital_name && (
                  <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{patient.hospital_name}</span>
                  </div>
                )}
              </div>
              
              {/* Arrow Icon */}
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
