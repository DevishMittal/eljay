'use client';

import React, { useState } from 'react';
import { cn } from '@/utils';
import WalkInAppointmentModal from '@/components/modals/walk-in-appointment-modal';
import AddTaskModal from '@/components/modals/add-task-modal';
import { useTask, Task } from '@/contexts/TaskContext';

interface TasksAnalyticsProps {
  className?: string;
}

const TasksAnalytics: React.FC<TasksAnalyticsProps> = ({ className }) => {
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'today' | 'tomorrow' | 'overdue' | 'upcoming'>('today');
  
  const { 
    getTodayTasks, 
    getTomorrowTasks, 
    getOverdueTasks, 
    getUpcomingTasks,

    toggleTaskCompletion 
  } = useTask();


  const todayTasks = getTodayTasks();
  const tomorrowTasks = getTomorrowTasks();
  const overdueTasks = getOverdueTasks();
  const upcomingTasks = getUpcomingTasks();

  const getCurrentTasks = () => {
    switch (currentView) {
      case 'today':
        return todayTasks;
      case 'tomorrow':
        return tomorrowTasks;
      case 'overdue':
        return overdueTasks;
      case 'upcoming':
        return upcomingTasks;
      default:
        return todayTasks;
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'today':
        return `Tasks for Today (${todayTasks.length})`;
      case 'tomorrow':
        return `Tasks for Tomorrow (${tomorrowTasks.length})`;
      case 'overdue':
        return `Overdue Tasks (${overdueTasks.length})`;
      case 'upcoming':
        return `Upcoming Tasks (${upcomingTasks.length})`;
      default:
        return `Tasks for Today (${todayTasks.length})`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };



  const handleTaskToggle = (taskId: string) => {
    toggleTaskCompletion(taskId);
  };

  const completedTodayTasks = todayTasks.filter(task => task.completed).length;
  const completedTomorrowTasks = tomorrowTasks.filter(task => task.completed).length;
  const completedUpcomingTasks = upcomingTasks.filter(task => task.completed).length;

  return (
    <div className={cn('w-64 bg-white border-l border-border flex flex-col h-full', className)}>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Tasks & Analytics</h2>
          <button 
            className="p-1 hover:bg-muted rounded-md transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Primary Actions */}
        <div className="space-y-2">
          <button 
            onClick={() => setIsWalkInModalOpen(true)}
            className="w-full bg-orange-500 text-white py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center space-x-2 hover:bg-orange-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Add Walk-in Appointment</span>
          </button>
          
          <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer transition-colors">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs font-medium text-foreground">Audiologist Overview</span>
            </div>
            <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <div className="flex items-center justify-between p-2 rounded-md">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-foreground">Task View</span>
            </div>
          </div>
        </div>

        {/* Task Navigation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  const views: Array<'today' | 'tomorrow' | 'overdue' | 'upcoming'> = ['today', 'tomorrow', 'overdue', 'upcoming'];
                  const currentIndex = views.indexOf(currentView);
                  const previousIndex = currentIndex > 0 ? currentIndex - 1 : views.length - 1;
                  setCurrentView(views[previousIndex]);
                }}
                className="p-1 hover:bg-muted rounded-md transition-colors"
                aria-label="Previous view"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-foreground capitalize">{currentView}</span>
              <button 
                onClick={() => {
                  const views: Array<'today' | 'tomorrow' | 'overdue' | 'upcoming'> = ['today', 'tomorrow', 'overdue', 'upcoming'];
                  const currentIndex = views.indexOf(currentView);
                  const nextIndex = currentIndex < views.length - 1 ? currentIndex + 1 : 0;
                  setCurrentView(views[nextIndex]);
                }}
                className="p-1 hover:bg-muted rounded-md transition-colors"
                aria-label="Next view"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <button 
              onClick={() => setCurrentView('today')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Today
            </button>
          </div>

          {/* Dynamic Task Summary */}
          <div className="space-y-2">
            <button
              onClick={() => setCurrentView('today')}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-md transition-colors",
                currentView === 'today' ? 'bg-red-50' : 'hover:bg-muted'
              )}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-foreground">TODAY</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full bg-red-500 rounded-full transition-all duration-300",
                      completedTodayTasks === 0 ? "w-0" :
                      completedTodayTasks === todayTasks.length ? "w-full" :
                      completedTodayTasks / todayTasks.length > 0.8 ? "w-5/6" :
                      completedTodayTasks / todayTasks.length > 0.6 ? "w-3/4" :
                      completedTodayTasks / todayTasks.length > 0.4 ? "w-1/2" :
                      completedTodayTasks / todayTasks.length > 0.2 ? "w-1/4" : "w-1/6"
                    )}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground">{todayTasks.length}</span>
              </div>
            </button>
            
            <button
              onClick={() => setCurrentView('overdue')}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-md transition-colors",
                currentView === 'overdue' ? 'bg-orange-50' : 'hover:bg-muted'
              )}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-foreground">OVERDUE</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full bg-orange-500 rounded-full transition-all duration-300",
                      overdueTasks.length === 0 ? "w-0" :
                      overdueTasks.length >= 5 ? "w-full" :
                      overdueTasks.length >= 4 ? "w-4/5" :
                      overdueTasks.length >= 3 ? "w-3/5" :
                      overdueTasks.length >= 2 ? "w-2/5" : "w-1/5"
                    )}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground">{overdueTasks.length}</span>
              </div>
            </button>
            
            <button
              onClick={() => setCurrentView('tomorrow')}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-md transition-colors",
                currentView === 'tomorrow' ? 'bg-blue-50' : 'hover:bg-muted'
              )}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-foreground">TOMORROW</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full bg-blue-500 rounded-full transition-all duration-300",
                      completedTomorrowTasks === 0 ? "w-0" :
                      completedTomorrowTasks === tomorrowTasks.length ? "w-full" :
                      completedTomorrowTasks / tomorrowTasks.length > 0.8 ? "w-5/6" :
                      completedTomorrowTasks / tomorrowTasks.length > 0.6 ? "w-3/4" :
                      completedTomorrowTasks / tomorrowTasks.length > 0.4 ? "w-1/2" :
                      completedTomorrowTasks / tomorrowTasks.length > 0.2 ? "w-1/4" : "w-1/6"
                    )}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground">{tomorrowTasks.length}</span>
              </div>
            </button>
            
            <button
              onClick={() => setCurrentView('upcoming')}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-md transition-colors",
                currentView === 'upcoming' ? 'bg-green-50' : 'hover:bg-muted'
              )}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-foreground">UPCOMING</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full bg-green-500 rounded-full transition-all duration-300",
                      completedUpcomingTasks === 0 ? "w-0" :
                      completedUpcomingTasks === upcomingTasks.length ? "w-full" :
                      completedUpcomingTasks / upcomingTasks.length > 0.8 ? "w-5/6" :
                      completedUpcomingTasks / upcomingTasks.length > 0.6 ? "w-3/4" :
                      completedUpcomingTasks / upcomingTasks.length > 0.4 ? "w-1/2" :
                      completedUpcomingTasks / upcomingTasks.length > 0.2 ? "w-1/4" : "w-1/6"
                    )}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground">{upcomingTasks.length}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Tasks List */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">{getViewTitle()}</h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {getCurrentTasks().length === 0 ? (
              <div className="bg-white border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">No tasks for this period</p>
              </div>
            ) : (
              getCurrentTasks().map((task: Task) => (
                <div key={task.id} className="bg-white border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => handleTaskToggle(task.id)}
                      className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" 
                      id={`task-${task.id}`}
                      aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={cn("px-2 py-1 text-xs rounded-full", getPriorityColor(task.priority))}>
                          {task.priority.toLowerCase()}
                        </span>
                        {task.setReminder && (
                          <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h0z" />
                          </svg>
                        )}
                      </div>
                      <h4 className={cn(
                        "text-sm font-medium",
                        task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                      )}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Due: {formatDate(task.dueDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add New Task Button */}
        <button 
          onClick={() => setIsAddTaskModalOpen(true)}
          className="w-full bg-white border border-border text-foreground py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-muted transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Task</span>
        </button>
      </div>

      {/* Modals */}
      <WalkInAppointmentModal 
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
      />
      
      <AddTaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
      />
    </div>
  );
};

export default TasksAnalytics;