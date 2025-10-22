'use client';

import React, { useState, useEffect } from 'react';
import { useBranchFilter } from '@/hooks/useBranchFilter';
import { useAuth } from '@/contexts/AuthContext';
import appointmentServiceWithBranch from '@/services/appointmentServiceWithBranch';
import { AppointmentsResponse } from '@/types';

/**
 * Example component showing how to use branch filtering with appointments
 * This demonstrates the integration of branch context with API calls
 */
const AppointmentsWithBranchFilter: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get branch filtering context
  const { branchId, branchDisplayName, isFilteringByBranch } = useBranchFilter();
  const { token } = useAuth();

  // Fetch appointments when branch selection changes
  useEffect(() => {
    fetchAppointments();
  }, [branchId, token]);

  const fetchAppointments = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await appointmentServiceWithBranch.getAppointments(
        1, // page
        10, // limit
        token,
        branchId // This is the key - pass the branchId for filtering
      );

      setAppointments(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAppointments();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Appointments - {branchDisplayName}
          </h2>
          <p className="text-sm text-gray-600">
            {isFilteringByBranch 
              ? `Showing appointments for selected branch` 
              : 'Showing all appointments (SuperAdmin view)'
            }
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : appointments ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Total appointments: {appointments.data.pagination.total}
          </div>
          
          {appointments.data.appointments.length > 0 ? (
            <div className="space-y-2">
              {appointments.data.appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {appointment.user?.fullname || 'Unknown Patient'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {appointment.audiologist?.name || 'No provider assigned'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.appointmentTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No appointments found for the selected branch.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default AppointmentsWithBranchFilter;

