/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useTask } from '@/contexts/TaskContext';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const { addTask } = useTask();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    dueDate: new Date().toISOString().split('T')[0],
    taskType: 'General' as 'General' | 'Patient Care' | 'Administrative' | 'Equipment' | 'Training',
    setReminder: false,
    reminderTime: '15 minutes before' as '5 minutes before' | '15 minutes before' | '30 minutes before' | '1 hour before' | '2 hours before' | '1 day before',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = () => {
    if (!validateForm()) return;

    addTask({
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      dueDate: new Date(formData.dueDate),
      taskType: formData.taskType,
      completed: false,
      setReminder: formData.setReminder,
      reminderTime: formData.reminderTime,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: new Date().toISOString().split('T')[0],
      taskType: 'General',
      setReminder: false,
      reminderTime: '15 minutes before',
    });
    setErrors({});
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: new Date().toISOString().split('T')[0],
      taskType: 'General',
      setReminder: false,
      reminderTime: '15 minutes before',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add New Task</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter task description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md  resize-none"
            />
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as 'Low' | 'Medium' | 'High')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md "
                aria-label="Select task priority"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md  ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-label="Select due date for task"
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Type
            </label>
            <select
              value={formData.taskType}
              onChange={(e) => handleInputChange('taskType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md "
              aria-label="Select task type"
            >
              <option value="General">General</option>
              <option value="Patient Care">Patient Care</option>
              <option value="Administrative">Administrative</option>
              <option value="Equipment">Equipment</option>
              <option value="Training">Training</option>
            </select>
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
                  <span className="text-sm font-medium text-gray-900">Set Reminder</span>
                  <p className="text-xs text-gray-600">Get notified before the task is due</p>
                </div>
              </div>
            </label>
            
            {/* Reminder Time Dropdown - Only show when reminder is checked */}
            {formData.setReminder && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remind me
                </label>
                <select
                  value={formData.reminderTime}
                  onChange={(e) => handleInputChange('reminderTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md  bg-white"
                  aria-label="Select reminder time"
                >
                  <option value="5 minutes before">5 minutes before</option>
                  <option value="15 minutes before">15 minutes before</option>
                  <option value="30 minutes before">30 minutes before</option>
                  <option value="1 hour before">1 hour before</option>
                  <option value="2 hours before">2 hours before</option>
                  <option value="1 day before">1 day before</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
