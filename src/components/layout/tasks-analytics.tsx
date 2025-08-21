'use client';

import React, { useState } from 'react';
import { cn } from '@/utils';
import WalkInAppointmentModal from '@/components/modals/walk-in-appointment-modal';

interface TasksAnalyticsProps {
  className?: string;
}

const TasksAnalytics: React.FC<TasksAnalyticsProps> = ({ className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className={cn('w-80 bg-white border-l border-border p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Tasks & Analytics</h2>
        <button 
          className="p-1 hover:bg-muted rounded-md transition-colors"
          aria-label="Close sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Primary Actions */}
      <div className="space-y-3">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-primary/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Walk-in Appointment</span>
        </button>
        
        <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium text-foreground">Audiologist Overview</span>
          </div>
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-foreground">Task View</span>
          </div>
        </div>
      </div>

      {/* Task Navigation */}
      <div className="space-y-3">
                  <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button 
                className="p-1 hover:bg-muted rounded-md transition-colors"
                aria-label="Previous day"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-foreground">Today</span>
              <button 
                className="p-1 hover:bg-muted rounded-md transition-colors"
                aria-label="Next day"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Today</button>
        </div>

        {/* Task Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-foreground">TODAY</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-1 bg-red-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">1</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-foreground">OVERDUE</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-1 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">19</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-foreground">PENDING</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">5</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-foreground">DONE</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-1 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-muted-foreground">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks for Today */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Tasks for Today (1)</h3>
        
        <div className="bg-white border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-start space-x-3">
            <input 
              type="radio" 
              className="mt-1" 
              id="task-weekend-setup"
              aria-label="Mark weekend consultation setup as complete"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">low</span>
              </div>
              <h4 className="text-sm font-medium text-foreground">Weekend consultation setup</h4>
              <p className="text-xs text-muted-foreground">Prepare clinic for weekend consultation with Thomas Anderson</p>
              <p className="text-xs text-muted-foreground">Due: Jun 28</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Task */}
      <button className="w-full bg-muted text-muted-foreground py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-muted/80 transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Add New Task</span>
      </button>

      {/* Walk-in Appointment Modal */}
      <WalkInAppointmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default TasksAnalytics;
