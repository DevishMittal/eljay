'use client';

import React, { useState } from 'react';
import { cn } from '@/utils';

interface Audiologist {
  id: string;
  name: string;
  initials: string;
  patients: number;
  confirmed: number;
  pending: number;
}

interface AudiologistOverviewProps {
  className?: string;
}

const AudiologistOverview: React.FC<AudiologistOverviewProps> = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sample audiologist data
  const audiologists: Audiologist[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      initials: 'DS',
      patients: 3,
      confirmed: 2,
      pending: 1
    },
    {
      id: '2',
      name: 'Dr. Michael Brown',
      initials: 'DM',
      patients: 2,
      confirmed: 1,
      pending: 1
    },
    {
      id: '3',
      name: 'Dr. Jennifer Lee',
      initials: 'DJ',
      patients: 2,
      confirmed: 2,
      pending: 0
    },
    {
      id: '4',
      name: 'Dr. Emily Rodriguez',
      initials: 'DE',
      patients: 1,
      confirmed: 1,
      pending: 0
    }
  ];

  const totalAudiologists = audiologists.length;
  const totalAppointments = audiologists.reduce((sum, audiologist) => 
    sum + audiologist.confirmed + audiologist.pending, 0
  );

  return (
    <div>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-0.5 hover:bg-muted rounded-md cursor-pointer transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-1">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-xs font-medium text-foreground">Audiologist Overview</span>
        </div>
        <svg 
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            isExpanded ? "rotate-180" : ""
          )} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-2">
          {/* Summary Statistics */}
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-md font-bold text-foreground">{totalAudiologists}</div>
              <div className="text-xs text-muted-foreground">Active Audiologists</div>
            </div>
            <div className="text-center">
              <div className="text-md font-bold text-foreground">{totalAppointments}</div>
              <div className="text-xs text-muted-foreground">Total Appointments</div>
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
                    <div className="text-md font-bold text-foreground">{audiologist.patients}</div>
                    <div className="text-xs text-muted-foreground">patients</div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  {audiologist.confirmed > 0 && (
                    <div className="flex items-center space-x-2  bg-green-100 border border-green-200 rounded-md px-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full "></div>
                      <span className="text-xs font-medium text-green-700 px-2 py-1 rounded-full">
                        {audiologist.confirmed} confirmed
                      </span>
                    </div>
                  )}
                  {audiologist.pending > 0 && (
                    <div className="flex items-center space-x-2 bg-yellow-100 border border-yellow-200 rounded-md px-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs font-medium text-yellow-700 px-3 py-1 rounded-full">
                        {audiologist.pending} pending
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudiologistOverview;
