/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useTask } from '@/contexts/TaskContext';
import { Task, UpdateTaskInput } from '@/types/task.types';
import CustomDropdown from '@/components/ui/custom-dropdown';
import CustomCalendar from '@/components/ui/custom-calendar';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function EditTaskModal({ isOpen, onClose, task }: EditTaskModalProps) {
  const { updateTask, loading } = useTask();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: new Date().toISOString().split('T')[0],
    type: 'general' as 'general' | 'follow_up' | 'equipment_maintenance' | 'review_results' | 'schedule_appointment',
    setReminder: false,
    reminderTime: '15 minutes before' as '5 minutes before' | '15 minutes before' | '30 minutes before' | '1 hour before' | '2 hours before' | '1 day before' | 'custom',
    customReminderTime: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCalendar, setShowCalendar] = useState(false);

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate || new Date().toISOString().split('T')[0],
        type: task.type,
        setReminder: !!task.reminderAt,
        reminderTime: '15 minutes before', // Default since we don't store the original reminder type
        customReminderTime: task.reminderAt || '',
      });
    }
  }, [task]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !task) return;

    try {
      const updateData: UpdateTaskInput = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        dueDate: formData.dueDate,
        type: formData.type,
      };

      // Add reminder if set
      if (formData.setReminder) {
        if (formData.reminderTime === 'custom' && formData.customReminderTime) {
          updateData.reminder = formData.customReminderTime;
        } else {
          // Calculate reminder time based on due date and reminder setting
          const dueDate = new Date(formData.dueDate);
          const reminderTime = calculateReminderTime(dueDate, formData.reminderTime);
          updateData.reminder = reminderTime?.toISOString() || null;
        }
      } else {
        updateData.reminder = null;
      }

      await updateTask(task.id, updateData);
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
      // Error handling is done in the context
    }
  };

  const handleCancel = () => {
    onClose();
  };

  // Helper function to calculate reminder time
  const calculateReminderTime = (dueDate: Date, reminderTime: string): Date | null => {
    const reminderDate = new Date(dueDate);
    
    switch (reminderTime) {
      case '5 minutes before':
        reminderDate.setMinutes(reminderDate.getMinutes() - 5);
        break;
      case '15 minutes before':
        reminderDate.setMinutes(reminderDate.getMinutes() - 15);
        break;
      case '30 minutes before':
        reminderDate.setMinutes(reminderDate.getMinutes() - 30);
        break;
      case '1 hour before':
        reminderDate.setHours(reminderDate.getHours() - 1);
        break;
      case '2 hours before':
        reminderDate.setHours(reminderDate.getHours() - 2);
        break;
      case '1 day before':
        reminderDate.setDate(reminderDate.getDate() - 1);
        break;
      default:
        reminderDate.setMinutes(reminderDate.getMinutes() - 15); // Default to 15 minutes
    }
    
    return reminderDate;
  };

  const handleDateChange = (date: Date) => {
    // Convert Date to YYYY-MM-DD string avoiding timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    handleInputChange('dueDate', dateString);
    setShowCalendar(false);
  };

  // Calculate days until due date
  const calculateDaysUntilDue = () => {
    if (!formData.dueDate) return null;
    
    // Parse the date string manually to avoid timezone issues
    const dateMatch = formData.dueDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) return null;
    
    const [, year, month, day] = dateMatch;
    const dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff === 0) return 'Due today';
    if (daysDiff === 1) return 'Due tomorrow';
    if (daysDiff === -1) return 'Due yesterday';
    if (daysDiff < 0) return `Overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'}`;
    return `Due in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`;
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border-2 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Edit Task</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none text-sm ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter task description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none text-sm"
            />
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className={`w-full px-3 py-2 border rounded-md text-left text-sm flex items-center justify-between ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-label="Select due date for task"
              >
                <span className="text-gray-700">
                  {formData.dueDate ? (() => {
                    // Parse date string manually to avoid timezone issues
                    const dateMatch = formData.dueDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                    if (dateMatch) {
                      const [, year, month, day] = dateMatch;
                      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      return date.toLocaleDateString();
                    }
                    return 'Invalid date';
                  })() : 'Select date'}
                </span>
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              {showCalendar && (
                <div className="absolute top-full left-0 z-50 mt-1">
                  <CustomCalendar
                    value={formData.dueDate ? (() => {
                      // Parse date string manually to avoid timezone issues
                      const dateMatch = formData.dueDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                      if (dateMatch) {
                        const [, year, month, day] = dateMatch;
                        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      }
                      return undefined;
                    })() : undefined}
                    onChange={handleDateChange}
                    minDate={new Date()}
                  />
                </div>
              )}
              {errors.dueDate && (
                <p className="mt-1 text-xs text-red-600">{errors.dueDate}</p>
              )}
              {/* Days until due calculation */}
              {formData.dueDate && (
                <p className="mt-1 text-xs text-gray-500">
                  {calculateDaysUntilDue()}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Priority
              </label>
              <CustomDropdown
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' }
                ]}
                value={formData.priority}
                onChange={(value) => handleInputChange('priority', value as 'low' | 'medium' | 'high')}
                placeholder="Select priority"
                aria-label="Select task priority"
              />
            </div>
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Task Type
            </label>
            <CustomDropdown
              options={[
                { value: 'general', label: 'General' },
                { value: 'follow_up', label: 'Follow-up' },
                { value: 'equipment_maintenance', label: 'Equipment Maintenance' },
                { value: 'review_results', label: 'Review Results' },
                { value: 'schedule_appointment', label: 'Schedule Appointment' }
              ]}
              value={formData.type}
              onChange={(value) => handleInputChange('type', value as 'general' | 'follow_up' | 'equipment_maintenance' | 'review_results' | 'schedule_appointment')}
              placeholder="Select task type"
              aria-label="Select task type"
            />
          </div>

          {/* Set Reminder */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.setReminder}
                onChange={(e) => handleInputChange('setReminder', e.target.checked)}
                className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
                aria-label="Set reminder for this task"
              />
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.73975 12.55C6.84215 12.7273 6.98942 12.8746 7.16677 12.977C7.34412 13.0794 7.5453 13.1333 7.75008 13.1333C7.95486 13.1333 8.15604 13.0794 8.33339 12.977C8.51074 12.8746 8.65801 12.7273 8.76041 12.55" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.6529 9.24017C2.57669 9.32369 2.5264 9.42756 2.50814 9.53914C2.48989 9.65071 2.50445 9.76519 2.55006 9.86865C2.59567 9.9721 2.67036 10.0601 2.76504 10.1219C2.85973 10.1836 2.97033 10.2166 3.0834 10.2167H12.4167C12.5298 10.2167 12.6404 10.1839 12.7352 10.1222C12.8299 10.0606 12.9047 9.97269 12.9504 9.8693C12.9961 9.76591 13.0108 9.65147 12.9927 9.53988C12.9746 9.42829 12.9245 9.32437 12.8484 9.24075C12.0726 8.441 11.2501 7.59108 11.2501 4.96667C11.2501 4.03841 10.8813 3.14817 10.2249 2.49179C9.56856 1.83542 8.67832 1.46667 7.75006 1.46667C6.8218 1.46667 5.93157 1.83542 5.27519 2.49179C4.61881 3.14817 4.25006 4.03841 4.25006 4.96667C4.25006 7.59108 3.42698 8.441 2.6529 9.24017Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <span className="text-xs font-medium text-gray-900">Set Reminder</span>
                  <p className="text-xs text-gray-600">Get notified before the task is due</p>
                </div>
              </div>
            </label>
            
            {/* Reminder Time Dropdown - Only show when reminder is checked */}
            {formData.setReminder && (
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Remind me
                </label>
                <CustomDropdown
                  options={[
                    { value: '5 minutes before', label: '5 minutes before' },
                    { value: '15 minutes before', label: '15 minutes before' },
                    { value: '30 minutes before', label: '30 minutes before' },
                    { value: '1 hour before', label: '1 hour before' },
                    { value: '2 hours before', label: '2 hours before' },
                    { value: '1 day before', label: '1 day before' },
                    { value: 'custom', label: 'Custom time' }
                  ]}
                  value={formData.reminderTime}
                  onChange={(value) => handleInputChange('reminderTime', value)}
                  placeholder="Select reminder time"
                  aria-label="Select reminder time"
                />
                
                {/* Custom Time Picker - Only show when custom is selected */}
                {formData.reminderTime === 'custom' && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Custom reminder time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.customReminderTime}
                      onChange={(e) => handleInputChange('customReminderTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().slice(0, 16)}
                      aria-label="Custom reminder date and time"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Set a specific date and time for the reminder
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 !border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
