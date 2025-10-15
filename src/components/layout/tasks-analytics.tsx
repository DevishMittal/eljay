'use client';

import React, { useState } from 'react';
import { cn } from '@/utils';
import WalkInAppointmentModal from '@/components/modals/walk-in-appointment-modal';
import AddTaskModal from '@/components/modals/add-task-modal';
import EditTaskModal from '@/components/modals/edit-task-modal';
import DeleteConfirmationModal from '@/components/modals/delete-confirmation-modal';
import AudiologistOverview from '@/components/layout/audiologist-overview';
import { useTask } from '@/contexts/TaskContext';
import { Task } from '@/types/task.types';

interface NewAppointment {
  id: string;
  date: Date;
  time: string;
  patient: string;
  type: string;
  duration: number;
  audiologist: string;
  notes: string;
  phoneNumber: string;
  email: string;
}

interface TasksAnalyticsProps {
  className?: string;
  onAppointmentCreated?: (appointment: NewAppointment) => void;
}

const TasksAnalytics: React.FC<TasksAnalyticsProps> = ({ className, onAppointmentCreated }) => {
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(0); // 0 = today, 1 = tomorrow, etc.
  
  const { 
    tasks,
    loading,
    error,
    getOverdueTasks, 
    getPendingTasks, 
    getDoneTasks,
    toggleTaskCompletion,
    deleteTask
  } = useTask();


  const overdueTasks = getOverdueTasks();
  const pendingTasks = getPendingTasks();
  const doneTasks = getDoneTasks();

  const getCurrentTasks = () => {
    // Get tasks for the selected date
    const getTasksForSelectedDate = () => {
      const dates = getCalendarDates();
      const selectedDateData = dates[selectedDate];
      if (!selectedDateData) return [];
      
      const selectedDateTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === selectedDateData.date.toDateString();
      });
      
      // Combine all relevant tasks and remove duplicates by ID
      const allTasks = [...selectedDateTasks, ...overdueTasks, ...doneTasks];
      const uniqueTasks = allTasks.filter((task, index, self) => 
        index === self.findIndex(t => t.id === task.id)
      );
      
      return uniqueTasks;
    };

    return getTasksForSelectedDate();
  };

  const getViewTitle = () => {
    const currentTasks = getCurrentTasks();
    const dates = getCalendarDates();
    const selectedDateData = dates[selectedDate];
    const dateLabel = selectedDateData?.label || 'Today';
    const totalTasks = currentTasks.length;
    const overdueCount = overdueTasks.length;
    const doneCount = doneTasks.length;
    
    return `Tasks for ${dateLabel} (${totalTasks}) - Overdue: ${overdueCount}, Done: ${doneCount}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCalendarDates = () => {
    const dates: { date: Date; label: string; index: number }[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let label = '';
      if (i === 0) {
        label = 'Today';
      } else if (i === 1) {
        label = 'Tomorrow';
      } else {
        label = formatDate(date);
      }
      
      dates.push({ date, label, index: i });
    }
    
    return dates;
  };

  const getCurrentDateLabel = () => {
    const dates = getCalendarDates();
    return dates[selectedDate]?.label || 'Today';
  };



  const handleTaskToggle = async (taskId: string) => {
    try {
      await toggleTaskCompletion(taskId);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteTaskModalOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (selectedTask) {
      try {
        await deleteTask(selectedTask.id);
        setIsDeleteTaskModalOpen(false);
        setSelectedTask(null);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const closeEditModal = () => {
    setIsEditTaskModalOpen(false);
    setSelectedTask(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteTaskModalOpen(false);
    setSelectedTask(null);
  };

  const currentTasks = getCurrentTasks();
  const completedCurrentTasks = currentTasks.filter(task => task.status === 'completed').length;

  return (
    <div className={cn('bg-white border-l border-border flex flex-col h-full transition-all duration-300', 
      isCollapsed ? 'w-12' : 'w-72', className)}>
      


      {/* Collapsed State - Show Expand Button */}
      {isCollapsed && (
        <div className="flex items-center justify-center p-4">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Expand sidebar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Fixed Header Section */}
      <div className={cn("flex-shrink-0", isCollapsed ? "hidden" : "py-3")}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2">
          <h2 className="text-sm font-semibold text-foreground">Tasks & Analytics</h2>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Division Line 1 - After Header */}
        <div className="!border-t border-border"></div>

        {/* Primary Actions */}
        <div className="space-y-2 px-3 py-2">
          <button 
            onClick={() => setIsWalkInModalOpen(true)}
            className="w-full bg-orange-500 text-white py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center space-x-2 hover:bg-orange-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Add Walk-in Appointment</span>
          </button>
          
          {/* Division Line 2 - After Add Walk-in Button */}
          <div className="!border-t border-border"></div>
          
          <div className="px-1">
            <AudiologistOverview />
          </div>
          
          {/* Division Line 3 - After Audiologist Overview */}
          <div className="!border-t border-border"></div>

          <div className="flex items-center justify-between p-2 rounded-md px-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-foreground">Task View</span>
            </div>
            <span className="text-xs text-black px-2 py-1 border rounded">
              Today
            </span>
          </div>
        </div>

        {/* Task Navigation */}
        <div className="space-y-3 px-3">
          <div className="flex items-center justify-between w-full">
                          <button 
                onClick={() => {
                  if (selectedDate > 0) {
                    setSelectedDate(selectedDate - 1);
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Previous date"
              >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs font-medium text-foreground">{getCurrentDateLabel()}</span>
                          <button 
                onClick={() => {
                  if (selectedDate < 6) {
                    setSelectedDate(selectedDate + 1);
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Next date"
              >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Division Line 4 - After Today/Tomorrow Navigation */}
          <div className="!border-t border-border"></div>

          {/* Visual Progress Indicators - Non-clickable */}
          <div className="space-y-2">
            <div className="w-full flex items-center justify-between p-2 rounded-md">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-foreground">TODAY</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-300"
                    style={{ 
                      width: currentTasks.length === 0 ? '0%' : 
                      `${Math.min(((currentTasks.length - completedCurrentTasks) / currentTasks.length) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">{currentTasks.length}</span>
              </div>
            </div>
            
            <div className="w-full flex items-center justify-between p-2 rounded-md">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-foreground">OVERDUE</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all duration-300"
                    style={{ 
                      width: overdueTasks.length === 0 ? '0%' : 
                      `${Math.min((overdueTasks.length / 10) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">{overdueTasks.length}</span>
              </div>
            </div>
            
            <div className="w-full flex items-center justify-between p-2 rounded-md">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-foreground">PENDING</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ 
                      width: pendingTasks.length === 0 ? '0%' : 
                      `${Math.min((pendingTasks.length / 10) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">{pendingTasks.length}</span>
              </div>
            </div>
            
            <div className="w-full flex items-center justify-between p-2 rounded-md">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-foreground">DONE</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ 
                      width: doneTasks.length === 0 ? '0%' : 
                      `${Math.min((doneTasks.length / 10) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">{doneTasks.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Division Line 5 - After Task Bars */}
        <div className="!border-t border-border"></div>
      </div>

      {/* Scrollable Tasks Section */}
      <div className={cn("flex-1 overflow-y-auto", isCollapsed ? "hidden" : "px-3")}>
        {/* Dynamic Tasks List */}
        <div className="space-y-3 py-3">
          <h3 className="text-xs font-medium text-foreground">{getViewTitle()}</h3>
          
          {/* Reduce space between tasks for today */}
          <div className="space-y-1">
            {getCurrentTasks().length === 0 ? (
              <div className="bg-white border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">No tasks for this period</p>
              </div>
            ) : (
              getCurrentTasks().map((task: Task) => (
                <div key={task.id} className="bg-white border border-border rounded-lg p-2 space-y-2">
                  <div className="flex items-start space-x-2">
                    <input 
                      type="checkbox" 
                      checked={task.status === 'completed'}
                      onChange={() => handleTaskToggle(task.id)}
                      className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-2 border-gray-300 rounded-full appearance-none checked:bg-green-600 checked:border-green-600 relative cursor-pointer" 
                      id={`task-${task.id}`}
                      aria-label={`Mark ${task.title} as ${task.status === 'completed' ? 'incomplete' : 'complete'}`}
                      style={{
                        backgroundImage: task.status === 'completed' ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z\'/%3e%3c/svg%3e")' : 'none',
                        backgroundSize: '12px',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        borderRadius: '50%'
                      }}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className={cn("px-1 py-0.5 text-xs rounded-full", getPriorityColor(task.priority))}>
                            {task.priority.toLowerCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            aria-label={`Edit task: ${task.title}`}
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            aria-label={`Delete task: ${task.title}`}
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <h4 className={cn(
                        "text-xs font-medium",
                        task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'
                      )}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground font-light">
                        Due: {formatDate(task.dueDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add New Task Button - Fixed at Bottom */}
      {!isCollapsed && (
        <div className="px-3 py-3 !border-t border-border ">
          <button 
            onClick={() => setIsAddTaskModalOpen(true)}
            className="w-full bg-white  border border-border text-foreground py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center space-x-2 hover:bg-muted transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Task</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <WalkInAppointmentModal 
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        onAppointmentCreated={onAppointmentCreated}
      />
      
      <AddTaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
      />

      <EditTaskModal 
        isOpen={isEditTaskModalOpen}
        onClose={closeEditModal}
        task={selectedTask}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteTaskModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteTask}
        itemName={selectedTask?.title || ''}
      />
    </div>
  );
};

export default TasksAnalytics;