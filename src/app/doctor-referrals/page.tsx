'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { cn } from '@/utils';
import AddDoctorModal from '@/components/modals/add-doctor-modal';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function DoctorReferralsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);

  // Mock data for charts
  const referralTrendsData = [
    { month: 'Jul', referrals: 16 },
    { month: 'Aug', referrals: 24 },
    { month: 'Sep', referrals: 18 },
    { month: 'Oct', referrals: 26 },
    { month: 'Nov', referrals: 32 },
    { month: 'Dec', referrals: 28 }
  ];

  const topServicesData = [
    { name: 'Pure Tone Audiometry', value: 1, color: '#3B82F6' },
    { name: 'Tympanometry', value: 1, color: '#10B981' },
    { name: 'OAE Testing', value: 1, color: '#F59E0B' },
    { name: 'Balance Assessment', value: 1, color: '#EF4444' },
    { name: 'Hearing Aid Fitting', value: 1, color: '#8B5CF6' }
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'referrals', label: 'Referrals' },
    { id: 'commission-statements', label: 'Commission Statements' }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: '#101828' }}>
              Doctor Referrals
            </h1>
            <p className="text-sm" style={{ color: '#717182' }}>
              Track referrals, commissions, and doctor relationships
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsAddDoctorModalOpen(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Doctor</span>
              </div>
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Generate Statement</span>
              </div>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg border border-border">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Key Metrics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Total Referrals */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Total Referrals</h3>
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>4</div>
                    <div className="text-sm" style={{ color: '#717182' }}>Total referrals this month</div>
                  </div>

                  {/* Completed */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Completed</h3>
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>3</div>
                    <div className="text-sm" style={{ color: '#717182' }}>Completed referrals</div>
                  </div>

                  {/* Revenue Generated */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Revenue Generated</h3>
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>₹1,67,700</div>
                    <div className="text-sm" style={{ color: '#717182' }}>Total revenue from referrals</div>
                  </div>

                  {/* Total Commissions */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Total Commissions</h3>
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>₹16,770</div>
                    <div className="text-sm" style={{ color: '#717182' }}>Total commissions paid</div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Referral Trends */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Referral Trends</h3>
                      <p className="text-sm" style={{ color: '#717182' }}>Monthly referral activity</p>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={referralTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#717182"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="#717182"
                          fontSize={12}
                          domain={[0, 32]}
                          ticks={[0, 8, 16, 24, 32]}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="referrals" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-between mt-4 text-sm">
                      <span style={{ color: '#717182' }}>Peak: Nov (32)</span>
                      <span className="text-green-600 font-medium">+87% 6-month growth</span>
                    </div>
                  </div>

                  {/* Top Performing Doctors */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Top Performing Doctors</h3>
                      <p className="text-sm" style={{ color: '#717182' }}>This month's leading referrers</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">1</span>
                          </div>
                          <div>
                            <div className="font-medium" style={{ color: '#101828' }}>Dr. Robert Thompson</div>
                            <div className="text-sm" style={{ color: '#717182' }}>ENT (Otolaryngology)</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium" style={{ color: '#101828' }}>3 referrals</div>
                          <div className="text-sm" style={{ color: '#717182' }}>₹16,570</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-green-600">2</span>
                          </div>
                          <div>
                            <div className="font-medium" style={{ color: '#101828' }}>Dr. Lisa Anderson</div>
                            <div className="text-sm" style={{ color: '#717182' }}>Neurology</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium" style={{ color: '#101828' }}>1 referral</div>
                          <div className="text-sm" style={{ color: '#717182' }}>₹200</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-orange-600">3</span>
                          </div>
                          <div>
                            <div className="font-medium" style={{ color: '#101828' }}>Dr. Michael Chen</div>
                            <div className="text-sm" style={{ color: '#717182' }}>Family Medicine</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium" style={{ color: '#101828' }}>0 referrals</div>
                          <div className="text-sm" style={{ color: '#717182' }}>₹0</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Commission Overview */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Commission Overview</h3>
                      <p className="text-sm" style={{ color: '#717182' }}>Payment status breakdown</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium" style={{ color: '#101828' }}>Pending Payments</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium" style={{ color: '#101828' }}>₹12,000</div>
                          <div className="text-sm" style={{ color: '#717182' }}>2 statements</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-medium" style={{ color: '#101828' }}>Paid This Month</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium" style={{ color: '#101828' }}>₹18,500</div>
                          <div className="text-sm" style={{ color: '#717182' }}>3 statements</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top 5 Services & Products */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Top 5 Services & Products</h3>
                      <p className="text-sm" style={{ color: '#717182' }}>Most referred items and services</p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex-1">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={topServicesData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {topServicesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-2">
                        {topServicesData.map((service, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: service.color }}
                            ></div>
                            <span className="text-sm" style={{ color: '#101828' }}>{service.name}</span>
                            <span className="text-sm font-medium" style={{ color: '#717182' }}>({service.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'referrals' && (
              <div className="space-y-6">
                {/* Referrals Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Referrals</h2>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">4</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Search Bar */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search patients or doctors..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        style={{ backgroundColor: '#F9FAFB' }}
                      />
                      <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    
                    {/* Doctor Filter */}
                    <select 
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      aria-label="Filter by doctor"
                    >
                      <option>All Doctors</option>
                      <option>Dr. Robert Thompson</option>
                      <option>Dr. Lisa Anderson</option>
                      <option>Dr. Michael Chen</option>
                    </select>
                    
                    {/* Status Filter */}
                    <select 
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      aria-label="Filter by status"
                    >
                      <option>Current</option>
                      <option>Completed</option>
                      <option>Pending</option>
                      <option>Active</option>
                    </select>
                  </div>
                </div>

                {/* Referrals Table */}
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services & Products</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Row 1 */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>15 Dec 2024</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium" style={{ color: '#101828' }}>John Smith</div>
                              <div className="text-sm" style={{ color: '#717182' }}>PAT001</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>Dr. Robert Thom...</td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm" style={{ color: '#101828' }}>Pure Tone Audiomet...</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded" style={{ color: '#717182' }}>Diagnostic</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">completed</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm" style={{ color: '#101828' }}>Tympanometry</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded" style={{ color: '#717182' }}>Diagnostic</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">completed</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#101828' }}>₹2,500</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#717182' }}>₹250</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">completed</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-gray-400 hover:text-gray-600">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </td>
                        </tr>

                        {/* Row 2 */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>20 Dec 2024</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium" style={{ color: '#101828' }}>Sarah Johnson</div>
                              <div className="text-sm" style={{ color: '#717182' }}>PAT002</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>Dr. Robert Thom...</td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm" style={{ color: '#101828' }}>OAE Testing</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded" style={{ color: '#717182' }}>Diagnostic</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">pending</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm" style={{ color: '#101828' }}>Siemens Pure Charg...</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded" style={{ color: '#717182' }}>Hearing Aid</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">pending</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#101828' }}>₹86,200</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#717182' }}>₹8,620</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">active</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-gray-400 hover:text-gray-600">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </td>
                        </tr>

                        {/* Row 3 */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>18 Dec 2024</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium" style={{ color: '#101828' }}>Michael Brown</div>
                              <div className="text-sm" style={{ color: '#717182' }}>PAT003</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>Dr. Lisa Anderson</td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm" style={{ color: '#101828' }}>Balance Assessment</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded" style={{ color: '#717182' }}>Diagnostic</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">completed</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#101828' }}>₹2,000</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#717182' }}>₹200</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">completed</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-gray-400 hover:text-gray-600">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </td>
                        </tr>

                        {/* Row 4 */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>22 Dec 2024</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium" style={{ color: '#101828' }}>Emma Wilson</div>
                              <div className="text-sm" style={{ color: '#717182' }}>PAT004</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>Dr. Robert Thom...</td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm" style={{ color: '#101828' }}>Hearing Aid Consult...</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded" style={{ color: '#717182' }}>Service</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">completed</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm" style={{ color: '#101828' }}>Phonak Audéo Para...</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded" style={{ color: '#717182' }}>Hearing Aid</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">completed</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#101828' }}>₹77,000</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#717182' }}>₹7,700</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">completed</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-gray-400 hover:text-gray-600">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Row */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-6">
                        <span style={{ color: '#101828' }}><strong>4 referrals</strong></span>
                        <span style={{ color: '#717182' }}>Services & Products: <strong>7 items</strong></span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <span style={{ color: '#101828' }}>Total Amount: <strong>₹1,67,700</strong></span>
                        <span style={{ color: '#717182' }}>Total Commission: <strong>₹16,770</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="bg-white px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Showing 1 to 4 of 4</span>
                        <select 
                          className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                          aria-label="Items per page"
                        >
                          <option>25</option>
                          <option>50</option>
                          <option>100</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                          &lt; Previous
                        </button>
                        <button className="px-3 py-1 text-sm bg-primary text-white rounded">1</button>
                        <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                          Next &gt;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'commission-statements' && (
              <div className="space-y-6">
                {/* Commission Statements Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Commission Statements</h2>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">2</span>
                  </div>
                </div>

                {/* Commission Statements Table */}
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrals</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Row 1 */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#101828' }}>Dr. Robert Thompson</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>December 2024</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>8</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#101828' }}>₹18,500</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#717182' }}>₹1,850</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">sent</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>15/1/2025</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="View statement"
                                title="View statement"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button 
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="Download statement"
                                title="Download statement"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Row 2 */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#101828' }}>Dr. Lisa Anderson</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>December 2024</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>5</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#101828' }}>₹12,000</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#717182' }}>₹1,200</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">draft</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>15/1/2025</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="View statement"
                                title="View statement"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button 
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="Download statement"
                                title="Download statement"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Total Row */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-6">
                        <span style={{ color: '#101828' }}><strong>Total</strong></span>
                        <span style={{ color: '#717182' }}>Statements: <strong>2 statements</strong></span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <span style={{ color: '#101828' }}>Total Referrals: <strong>13</strong></span>
                        <span style={{ color: '#101828' }}>Total Revenue: <strong>₹30,500</strong></span>
                        <span className="text-green-600 font-medium">Total Commission: <strong>₹3,050</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="bg-white px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Showing 1 to 2 of 2</span>
                        <select 
                          className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                          aria-label="Items per page"
                        >
                          <option>25</option>
                          <option>50</option>
                          <option>100</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                          &lt; Previous
                        </button>
                        <button className="px-3 py-1 text-sm bg-primary text-white rounded">1</button>
                        <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                          Next &gt;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Doctor Modal */}
      <AddDoctorModal
        isOpen={isAddDoctorModalOpen}
        onClose={() => setIsAddDoctorModalOpen(false)}
        onSubmit={(doctorData) => {
          console.log('New doctor data:', doctorData);
          // Here you would typically send the data to your API
          // For now, we'll just log it and close the modal
          setIsAddDoctorModalOpen(false);
        }}
      />
    </MainLayout>
  );
}
