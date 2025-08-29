'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/utils';
import { appointmentService } from '@/services/appointmentService';
import { Audiologist } from '@/types';

interface AudiologistWithStats extends Audiologist {
  initials: string;
  totalAppointments: number;
  availableSlots: number;
}

interface AudiologistOverviewProps {
  className?: string;
}

const AudiologistOverview: React.FC<AudiologistOverviewProps> = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [audiologists, setAudiologists] = useState<AudiologistWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch audiologists data from API
  useEffect(() => {
    fetchAudiologists();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => fetchAudiologists(true), 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAudiologists = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const response = await appointmentService.getAvailableAudiologists();
      
      // Transform API data to include stats
      const audiologistsWithStats: AudiologistWithStats[] = response.data.map(audiologist => {
        // Generate initials from name
        const initials = audiologist.name
          .split(' ')
          .map(word => word.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2);
        
        // Calculate available time slots based on availability
        const availableSlots = Object.values(audiologist.availability).filter(Boolean).length;
        
        return {
          ...audiologist,
          initials,
          totalAppointments: audiologist.bookedSlots.length,
          availableSlots
        };
      });
      
      setAudiologists(audiologistsWithStats);
    } catch (err) {
      setError('Failed to load audiologists');
      console.error('Error fetching audiologists:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalAudiologists = audiologists.length;
  const totalAppointments = audiologists.reduce((sum, audiologist) => 
    sum + audiologist.totalAppointments, 0
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-0.5">
        <div 
          className="flex items-center space-x-1 hover:bg-muted rounded-md cursor-pointer transition-colors flex-1 p-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-xs font-medium text-foreground">Audiologist Overview</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchAudiologists(true);
            }}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Refresh audiologists"
            title="Refresh data"
          >
            <svg 
              className={cn("w-3 h-3 text-muted-foreground", loading ? "animate-spin" : "")} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <svg 
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200 cursor-pointer",
              isExpanded ? "rotate-180" : ""
            )} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              <span className="ml-2 text-xs text-gray-600">Loading audiologists...</span>
            </div>
          ) : error ? (
            <div className="text-center p-4">
              <p className="text-xs text-red-600 mb-2">{error}</p>
              <button 
                onClick={() => fetchAudiologists()}
                className="text-xs text-orange-600 hover:text-orange-700 underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {/* Summary Statistics */}
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="text-md font-bold text-foreground">{totalAudiologists}</div>
                  <div className="text-xs text-muted-foreground">Active Audiologists</div>
                </div>
                <div className="text-center">
                  <div className="text-md font-bold text-foreground">{totalAppointments}</div>
                  <div className="text-xs text-muted-foreground">Booked Slots</div>
                </div>
              </div>

              {/* Audiologist List */}
              <div className="space-y-2">
                {audiologists.map((audiologist) => (
                  <div key={audiologist.id} className="bg-white border border-border rounded-lg p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">{audiologist.initials}</span>
                        </div>
                        <span className="text-xs font-semibold text-foreground">{audiologist.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-md font-bold text-foreground">{audiologist.totalAppointments}</div>
                        <div className="text-xs text-muted-foreground">booked</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {/* Availability indicators */}
                      {audiologist.availability.morning && (
                        <div className="flex items-center space-x-1 bg-green-100 border border-green-200 rounded-md px-2 py-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs font-medium text-green-700">Morning</span>
                        </div>
                      )}
                      {audiologist.availability.afternoon && (
                        <div className="flex items-center space-x-1 bg-blue-100 border border-blue-200 rounded-md px-2 py-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs font-medium text-blue-700">Afternoon</span>
                        </div>
                      )}
                      {audiologist.availability.evening && (
                        <div className="flex items-center space-x-1 bg-purple-100 border border-purple-200 rounded-md px-2 py-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-xs font-medium text-purple-700">Evening</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Show if no availability */}
                    {!audiologist.availability.morning && !audiologist.availability.afternoon && !audiologist.availability.evening && (
                      <div className="flex items-center space-x-1 bg-red-100 border border-red-200 rounded-md px-2 py-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs font-medium text-red-700">Not Available</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AudiologistOverview;
