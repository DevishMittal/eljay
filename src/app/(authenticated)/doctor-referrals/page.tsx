'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import AddDoctorModal from '@/components/modals/add-doctor-modal';
import { referralService } from '@/services/referralService';
import { useAuth } from '@/contexts/AuthContext';
import { ReferralSource } from '@/types';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, DollarSign, FileText, TrendingUp, CheckCircle, ChartPie } from 'lucide-react';

export default function DoctorReferralsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [referrals, setReferrals] = useState<ReferralSource[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // Fetch referrals from API
  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setLoading(true);
        const response = await referralService.getReferrals(token || undefined);
        if (response.status === 'success') {
          setReferrals(response.data);
        }
      } catch (error) {
        console.error('Error fetching referrals:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchReferrals();
    }
  }, [token]);

  // Filter doctor referrals only (excluding direct/walk-in)
  const doctorReferrals = referrals.filter(ref => ref.type === 'doctor');

  // Calculate metrics from real data
  const totalReferrals = referrals.length;
  const totalDoctorReferrals = doctorReferrals.length;

  // Mock data for charts (keeping as is since API doesn't provide this data)
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

  // Mock data for revenue and commissions (keeping as is since API doesn't provide this data)
  const totalRevenue = '₹1,67,700';
  const totalCommissions = '₹16,770';
  const pendingPayments = '₹12,000';
  const paidThisMonth = '₹18,500';

  // Summary cards data (same structure as billing invoices)
  const summaryCards = [
    {
      title: "Total Referrals",
      value: totalReferrals.toString(),
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      title: "Completed",
      value: totalDoctorReferrals.toString(),
      icon: TrendingUp,
      bgColor: "bg-green-100",
      iconColor: "text-green-700",
    },
    {
      title: "Revenue Generated",
      value: totalRevenue,
      icon: DollarSign,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-700",
    },
    {
      title: "Total Commissions",
      value: totalCommissions,
      icon: FileText,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-700",
    },
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'referrals', label: 'Referrals' },
    { id: 'commission-statements', label: 'Commission Statements' }
  ];

  // Generate mock patient data for referrals table (keeping UI the same)
  const mockReferralData = [
    {
      id: '1',
      date: '15 Dec 2024',
      patient: { name: 'John Smith', id: 'PAT001' },
      doctor: 'Dr. Robert Thompson',
      services: [
        { name: 'Pure Tone Audiometry', type: 'Diagnostic', status: 'completed' },
        { name: 'Tympanometry', type: 'Diagnostic', status: 'completed' }
      ],
      amount: '₹2,500',
      commission: '₹250',
      status: 'completed'
    },
    {
      id: '2',
      date: '20 Dec 2024',
      patient: { name: 'Sarah Johnson', id: 'PAT002' },
      doctor: 'Dr. Robert Thompson',
      services: [
        { name: 'OAE Testing', type: 'Diagnostic', status: 'pending' },
        { name: 'Siemens Pure Charg...', type: 'Hearing Aid', status: 'pending' }
      ],
      amount: '₹86,200',
      commission: '₹8,620',
      status: 'active'
    },
    {
      id: '3',
      date: '18 Dec 2024',
      patient: { name: 'Michael Brown', id: 'PAT003' },
      doctor: 'Dr. Lisa Anderson',
      services: [
        { name: 'Balance Assessment', type: 'Diagnostic', status: 'completed' }
      ],
      amount: '₹2,000',
      commission: '₹200',
      status: 'completed'
    },
    {
      id: '4',
      date: '22 Dec 2024',
      patient: { name: 'Emma Wilson', id: 'PAT004' },
      doctor: 'Dr. Robert Thompson',
      services: [
        { name: 'Hearing Aid Consult...', type: 'Service', status: 'completed' },
        { name: 'Phonak Audéo Para...', type: 'Hearing Aid', status: 'completed' }
      ],
      amount: '₹77,000',
      commission: '₹7,700',
      status: 'completed'
    }
  ];

  // Mock commission statements data (keeping as is since API doesn't provide this data)
  const mockCommissionStatements = [
    {
      doctor: 'Dr. Robert Thompson',
      period: 'December 2024',
      referrals: 8,
      revenue: '₹18,500',
      commission: '₹1,850',
      status: 'sent',
      dueDate: '15/1/2025'
    },
    {
      doctor: 'Dr. Lisa Anderson',
      period: 'December 2024',
      referrals: 5,
      revenue: '₹12,000',
      commission: '₹1,200',
      status: 'draft',
      dueDate: '15/1/2025'
    }
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
              className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Doctor</span>
              </div>
            </button>
            <button className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
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
        <div className="bg-[#ECECF0] rounded-full p-1 mb-6">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-full flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'text-[#0A0A0A] bg-white shadow-sm'
                    : 'text-[#0A0A0A] hover:bg-white/50'
                }`}
                style={{ fontFamily: 'Segoe UI' }}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {summaryCards.map((card, index) => {
                    const IconComponent = card.icon;
                    return (
                      <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                className="text-xs text-[#4A5565]"
                                style={{ fontFamily: "Segoe UI" }}
                              >
                                {card.title}
                              </p>
                              <p
                                className="text-xl font-semibold text-gray-900"
                                style={{ fontFamily: "Segoe UI" }}
                              >
                                {card.value}
                              </p>
                            </div>
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${card.bgColor}`}
                            >
                              <IconComponent className={`w-5 h-5 ${card.iconColor}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                    <div className="flex items-center text-xs justify-between mt-4  bg-blue-50 rounded-lg p-2">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-xs" style={{ color: '#717182' }}> Peak: Nov (32)</span>
                      </div>
                      <div className="flex flex-col justify-end items-end"> <span className="text-green-600 font-medium">+87% </span>
                      <span className="text-gray-500 ">6-month growth</span></div>
                     
                    </div>
                  </div>

                  {/* Top Performing Doctors */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold mb-2" style={{ color: '#101828' }}>Top Performing Doctors</h3>
                      <p className="text-xs" style={{ color: '#717182' }}>This month&apos;s leading referrers</p>
                    </div>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center py-4">
                          <div className="text-sm text-gray-500">Loading...</div>
                        </div>
                      ) : doctorReferrals.length > 0 ? (
                        doctorReferrals.slice(0, 3).map((referral, index) => (
                          <div key={referral.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                index === 0 ? 'bg-blue-100' : index === 1 ? 'bg-green-100' : 'bg-orange-100'
                              }`}>
                                <span className={`text-sm font-semibold ${
                                  index === 0 ? 'text-blue-600' : index === 1 ? 'text-green-600' : 'text-orange-600'
                                }`}>{index + 1}</span>
                              </div>
                              <div>
                                <div className="font-medium text-sm" style={{ color: '#101828' }}>{referral.sourceName}</div>
                                <div className="text-xs" style={{ color: '#717182' }}>{referral.specialization || 'General'}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-sm" style={{ color: '#101828' }}>1 referral</div>
                              <div className="text-xs" style={{ color: '#717182' }}>₹200</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <div className="text-sm text-gray-500">No doctor referrals found</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Commission Overview */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="mb-6">
                      <h3 className="text-sm mb-2" style={{ color: '#101828' }}>Commission Overview</h3>
                      <p className="text-xs" style={{ color: '#717182' }}>Payment status breakdown</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 py-1 border border-yellow-100 bg-yellow-50 rounded-lg" style={{ boxShadow: '0 0 0 1px #fde047' }}>
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium" style={{ color: '#101828' }}>Pending Payments</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm" style={{ color: '#101828' }}>{pendingPayments}</div>
                          <div className="text-xs" style={{ color: '#717182' }}>2 statements</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 py-1 border border-green-100 bg-green-50 rounded-lg" style={{ boxShadow: '0 0 0 1px #86efac' }}>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium" style={{ color: '#101828' }}>Paid This Month</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm" style={{ color: '#101828' }}>{paidThisMonth}</div>
                          <div className="text-xs" style={{ color: '#717182' }}>3 statements</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top 5 Services & Products */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="mb-6">
                      <h3 className="text-sm mb-2" style={{ color: '#101828' }}>
                        <ChartPie className="w-4 h-4 text-blue-600 inline mr-2" />
                        Top 5 Services & Products
                      </h3>
                      <p className="text-xs" style={{ color: '#717182' }}>Most referred items and services</p>
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
                              {topServicesData.map((service, index) => (
                                <Cell key={`cell-${index}`} fill={service.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-2">
                        {topServicesData.map((service, index) => (
                          <div key={index} className="flex items-center space-x-2 space-y-3">
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
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">{totalReferrals}</span>
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
                      {loading ? (
                        <option>Loading...</option>
                      ) : (
                        doctorReferrals.map((referral) => (
                          <option key={referral.id} value={referral.id}>
                            {referral.sourceName}
                          </option>
                        ))
                      )}
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
                        {loading ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                              Loading referrals...
                            </td>
                          </tr>
                        ) : mockReferralData.length > 0 ? (
                          mockReferralData.map((referral) => (
                            <tr key={referral.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>{referral.date}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium" style={{ color: '#101828' }}>{referral.patient.name}</div>
                                  <div className="text-sm" style={{ color: '#717182' }}>{referral.patient.id}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>{referral.doctor}</td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  {referral.services.map((service, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <span className="text-sm" style={{ color: '#101828' }}>{service.name}</span>
                                      <span className="text-xs px-2 py-1 bg-gray-100 rounded" style={{ color: '#717182' }}>{service.type}</span>
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        service.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                      }`}>{service.status}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#101828' }}>{referral.amount}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#717182' }}>{referral.commission}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  referral.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>{referral.status}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button 
                                  className="text-gray-400 hover:text-gray-600"
                                  aria-label="View referral details"
                                  title="View referral details"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                              No referrals found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Row */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-6">
                        <span style={{ color: '#101828' }}><strong>{totalReferrals} referrals</strong></span>
                        <span style={{ color: '#717182' }}>Services & Products: <strong>7 items</strong></span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <span style={{ color: '#101828' }}>Total Amount: <strong>{totalRevenue}</strong></span>
                        <span style={{ color: '#717182' }}>Total Commission: <strong>{totalCommissions}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="bg-white px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Showing 1 to {Math.min(totalReferrals, 4)} of {totalReferrals}</span>
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
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">{mockCommissionStatements.length}</span>
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
                        {mockCommissionStatements.map((statement, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#101828' }}>{statement.doctor}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>{statement.period}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>{statement.referrals}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#101828' }}>{statement.revenue}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#717182' }}>{statement.commission}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                statement.status === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>{statement.status}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#101828' }}>{statement.dueDate}</td>
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
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Total Row */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-6">
                        <span style={{ color: '#101828' }}><strong>Total</strong></span>
                        <span style={{ color: '#717182' }}>Statements: <strong>{mockCommissionStatements.length} statements</strong></span>
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
                        <span className="text-sm text-gray-700">Showing 1 to {mockCommissionStatements.length} of {mockCommissionStatements.length}</span>
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
