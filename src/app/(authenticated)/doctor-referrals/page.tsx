'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import AddDoctorModal from '@/components/modals/add-doctor-modal';
import { referralService } from '@/services/referralService';
import { referralAnalyticsService } from '@/services/referralAnalyticsService';
import { DashboardService, DashboardDoctorReferralData } from '@/services/dashboardService';
import { useAuth } from '@/contexts/AuthContext';
import { ReferralSource } from '@/types';
import { formatCurrency } from '@/utils/commissionUtils';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, FileText, TrendingUp, CheckCircle, ChartPie, Filter } from 'lucide-react';
import RupeeIcon from '@/components/ui/rupee-icon';

export default function DoctorReferralsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [referrals, setReferrals] = useState<ReferralSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorReferralData, setDoctorReferralData] = useState<DashboardDoctorReferralData | null>(null);
  const [analytics, setAnalytics] = useState<Array<{
    referralId: string;
    referralSource: ReferralSource;
    totalAppointments: number;
    totalRevenue: number;
    totalCommission: number;
    appointments: Array<{
      id: string;
      date: string;
      patientName: string;
      procedures: string[];
      amount: number;
      commission: number;
      status: 'completed' | 'pending' | 'cancelled';
    }>;
    lastActivity: string;
  }>>([]);
  const [summaryStats, setSummaryStats] = useState<{
    totalReferrals: number;
    totalDoctorReferrals: number;
    totalRevenue: number;
    totalCommission: number;
    pendingPayments: number;
    paidThisMonth: number;
  } | null>(null);
  const [referralTrends, setReferralTrends] = useState<Array<{
    month: string;
    referrals: number;
    revenue: number;
    commission: number;
  }>>([]);
  const [topDoctors, setTopDoctors] = useState<Array<{
    doctorId: string;
    doctorName: string;
    specialization: string;
    referrals: number;
    revenue: number;
    commission: number;
  }>>([]);
  const [commissionStatements, setCommissionStatements] = useState<Array<{
    doctorId: string;
    doctorName: string;
    period: string;
    referrals: number;
    revenue: number;
    commission: number;
    status: 'draft' | 'sent' | 'paid';
    dueDate: string;
  }>>([]);
  const { token } = useAuth();

  // Fetch referrals and analytics from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get date range for last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        
        const dateRange = {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };

        // Fetch real doctor referral data from dashboard API
        const doctorReferralResponse = await DashboardService.getDoctorReferralData(dateRange.startDate, dateRange.endDate);
        setDoctorReferralData(doctorReferralResponse);
        
        // Fetch basic referrals
        const referralsResponse = await referralService.getReferrals(token || undefined);
        if (referralsResponse.status === 'success') {
          setReferrals(referralsResponse.data);
        }

        // Fetch analytics data
        const [analyticsData, summaryData, trendsData, topDoctorsData, statementsData] = await Promise.all([
          referralAnalyticsService.getReferralAnalytics(token || undefined),
          referralAnalyticsService.getSummaryStats(token || undefined),
          referralAnalyticsService.getReferralTrends(token || undefined),
          referralAnalyticsService.getTopPerformingDoctors(token || undefined),
          referralAnalyticsService.generateCommissionStatements(token || undefined),
        ]);

        setAnalytics(analyticsData);
        setSummaryStats(summaryData);
        setReferralTrends(trendsData);
        setTopDoctors(topDoctorsData);
        setCommissionStatements(statementsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Filter referrals by type
  const doctorReferrals = referrals.filter(ref => ref.type === 'doctor');
  const directReferrals = referrals.filter(ref => ref.type === 'direct');
  const walkInReferrals = referrals.filter(ref => ref.sourceName === 'Walk-in');

  // Use real data from dashboard API for doctor referrals specifically
  const totalDoctorReferrals = doctorReferralData?.overview?.referrals ?? doctorReferrals.length;
  const totalActiveDoctors = doctorReferralData?.overview?.activeDoctors ?? doctorReferrals.length;
  
  // For total referrals, we want to show all types but the dashboard focuses on doctor referrals
  const totalReferrals = referrals.length; // All referrals (direct, walk-in, doctor)
  
  const totalRevenue = formatCurrency(doctorReferralData?.financialImpact?.revenueGenerated ?? summaryStats?.totalRevenue ?? 0);
  const totalCommissions = formatCurrency(doctorReferralData?.financialImpact?.commission ?? summaryStats?.totalCommission ?? 0);
  const pendingPayments = formatCurrency(summaryStats?.pendingPayments || 0);
  const paidThisMonth = formatCurrency(summaryStats?.paidThisMonth || 0);

  // Use real trends data with fallback
  const referralTrendsData = referralTrends.length > 0 
    ? referralTrends.map(trend => ({
        month: trend.month,
        referrals: trend.referrals,
        revenue: trend.revenue,
        commission: trend.commission
      }))
    : [
        { month: 'Sep 2024', referrals: 0, revenue: 0, commission: 0 },
        { month: 'Oct 2024', referrals: 0, revenue: 0, commission: 0 },
        { month: 'Nov 2024', referrals: 0, revenue: 0, commission: 0 },
        { month: 'Dec 2024', referrals: 0, revenue: 0, commission: 0 }
      ];

  // Calculate dynamic Y-axis domain based on actual data
  const maxReferrals = Math.max(...referralTrendsData.map(trend => trend.referrals), 1);
  const yAxisMax = Math.ceil(maxReferrals * 1.2); // Add 20% padding
  
  // Generate unique Y-axis ticks to avoid duplicate keys
  const generateUniqueTicks = (max: number, count: number) => {
    if (max <= 1) return [0, 1]; // For very small values, just use 0 and 1
    const step = max / (count - 1);
    const ticks = Array.from({ length: count }, (_, i) => Math.round(step * i));
    // Remove duplicates and ensure we have at least 2 unique values
    const uniqueTicks = [...new Set(ticks)].sort((a, b) => a - b);
    return uniqueTicks.length >= 2 ? uniqueTicks : [0, max];
  };
  
  const yAxisTicks = generateUniqueTicks(yAxisMax, 5);

  // Calculate peak month and growth
  const peakMonth = referralTrendsData.reduce((max, trend) => 
    trend.referrals > max.referrals ? trend : max, 
    { month: 'N/A', referrals: 0, revenue: 0, commission: 0 }
  );
  
  const firstMonth = referralTrendsData[0]?.referrals || 0;
  const lastMonth = referralTrendsData[referralTrendsData.length - 1]?.referrals || 0;
  const growthPercentage = firstMonth > 0 ? Math.round(((lastMonth - firstMonth) / firstMonth) * 100) : 0;

  // Generate real top services data from analytics
  const procedureCounts: { [key: string]: number } = {};
  analytics.forEach(analyticsItem => {
    analyticsItem.appointments.forEach(appointment => {
      appointment.procedures.forEach(procedure => {
        procedureCounts[procedure] = (procedureCounts[procedure] || 0) + 1;
      });
    });
  });

  const topServicesData = Object.entries(procedureCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count], index) => ({
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      value: count,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index]
    }));

  // Fallback if no procedures found
  const finalTopServicesData = topServicesData.length > 0 ? topServicesData : [
    { name: 'No procedures yet', value: 1, color: '#E5E7EB' }
  ];

  // Summary cards data - focused on doctor referrals
  const summaryCards = [
    {
      title: "Doctor Referrals",
      value: totalDoctorReferrals.toString(),
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      title: "Active Doctors",
      value: totalActiveDoctors.toString(),
      icon: TrendingUp,
      bgColor: "bg-green-100",
      iconColor: "text-green-700",
    },
    {
      title: "Revenue Generated",
      value: totalRevenue,
      icon: RupeeIcon,
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

  // Generate referral data from the referrals API with proper categorization
  const referralData = referrals.map((referral, index) => {
    const createdDate = new Date(referral.createdAt || new Date());
    return {
      id: referral.id,
      date: createdDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      patient: { 
        name: referral.sourceName, 
        id: `REF${(referral.id || '000').slice(-3).toUpperCase()}` 
      },
      doctor: referral.type === 'doctor' ? referral.sourceName : 'N/A',
      type: referral.type,
      sourceName: referral.sourceName,
      contactNumber: referral.contactNumber || 'N/A',
      hospital: referral.hospital || 'N/A',
      specialization: referral.specialization || 'N/A',
      services: [{
        name: referral.type === 'doctor' ? 'Doctor Referral' : referral.type === 'direct' ? 'Direct Referral' : 'Walk-in',
        type: referral.type,
        status: 'pending' as const
      }],
      amount: formatCurrency(0), // No amount data in referrals API
      commission: formatCurrency(0), // No commission data in referrals API
      status: 'pending' as const
    };
  });

  // Use real commission statements data with unique keys
  let statementCounter = 0;
  const commissionStatementsData = commissionStatements.map((statement) => {
    statementCounter++;
    return {
      id: `statement-${statementCounter}-${statement.doctorId}`, // Ensure unique keys
      doctor: statement.doctorName,
      period: statement.period,
      referrals: statement.referrals,
      revenue: formatCurrency(statement.revenue),
      commission: formatCurrency(statement.commission),
      status: statement.status,
      dueDate: statement.dueDate
    };
  });

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
                          domain={[0, yAxisMax]}
                          ticks={yAxisTicks}
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
                        <span className="text-xs" style={{ color: '#717182' }}> Peak: {peakMonth.month} ({peakMonth.referrals})</span>
                      </div>
                      <div className="flex flex-col justify-end items-end"> 
                        <span className={`font-medium ${growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {growthPercentage >= 0 ? '+' : ''}{growthPercentage}% 
                        </span>
                        <span className="text-gray-500 ">Growth</span>
                      </div>
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
                      ) : doctorReferralData?.doctorPerformance && doctorReferralData.doctorPerformance.length > 0 ? (
                        doctorReferralData.doctorPerformance.slice(0, 3).map((doctor, index) => (
                          <div key={`${doctor.doctorName}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                index === 0 ? 'bg-blue-100' : index === 1 ? 'bg-green-100' : 'bg-orange-100'
                              }`}>
                                <span className={`text-sm font-semibold ${
                                  index === 0 ? 'text-blue-600' : index === 1 ? 'text-green-600' : 'text-orange-600'
                                }`}>{index + 1}</span>
                              </div>
                              <div>
                                <div className="font-medium text-sm" style={{ color: '#101828' }}>{doctor.doctorName}</div>
                                <div className="text-xs" style={{ color: '#717182' }}>{doctor.specialization}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-sm" style={{ color: '#101828' }}>{doctor.totalReferrals} referrals</div>
                              <div className="text-xs" style={{ color: '#717182' }}>{doctor.conversionRate}% conversion</div>
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
                          <div className="text-xs" style={{ color: '#717182' }}>
                            {commissionStatementsData.filter(s => s.status === 'draft').length} statements
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 py-1 border border-green-100 bg-green-50 rounded-lg" style={{ boxShadow: '0 0 0 1px #86efac' }}>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium" style={{ color: '#101828' }}>Paid This Month</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm" style={{ color: '#101828' }}>{paidThisMonth}</div>
                          <div className="text-xs" style={{ color: '#717182' }}>
                            {commissionStatementsData.filter(s => s.status === 'sent' || s.status === 'paid').length} statements
                          </div>
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
                              data={finalTopServicesData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {finalTopServicesData.map((service, index) => (
                                <Cell key={`cell-${index}`} fill={service.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-2">
                        {finalTopServicesData.map((service, index) => (
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
                    <h2 className="text-sm " style={{ color: '#101828' }}>All Referrals</h2>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">Doctor: {doctorReferrals.length}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-sm rounded-full">Direct: {directReferrals.length}</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-sm rounded-full">Walk-in: {walkInReferrals.length}</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">Total: {totalReferrals}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative w-64">
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search patients or doctors..."
                        className="pl-10 bg-gray-100 placeholder-[#717182] h-9 w-full rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <button className="bg-white text-gray-700 hover:bg-gray-50 inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-9 px-3 py-2 text-sm">
                      <Filter className="w-4 h-4 mr-2"/>
                      All Doctors
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <button className="bg-white text-gray-700 hover:bg-gray-50 inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-9 px-3 py-2 text-sm">
                      <Filter className="w-4 h-4 mr-2"/>
                      All Status
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Referrals Table */}
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
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
                        ) : referralData.length > 0 ? (
                          referralData.map((referral) => (
                            <tr key={referral.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-xs" style={{ color: '#101828' }}>{referral.date}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-xs font-medium" style={{ color: '#101828' }}>{referral.sourceName}</div>
                                  <div className="text-xs" style={{ color: '#717182' }}>{referral.patient.id}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  referral.type === 'doctor' ? 'bg-blue-100 text-blue-800' : 
                                  referral.type === 'direct' ? 'bg-green-100 text-green-800' : 
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {referral.type === 'doctor' ? 'Doctor' : 
                                   referral.type === 'direct' ? 'Direct' : 'Walk-in'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-xs" style={{ color: '#101828' }}>{referral.contactNumber}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-xs" style={{ color: '#101828' }}>{referral.hospital}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-xs" style={{ color: '#101828' }}>{referral.specialization}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  referral.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                }`}>{referral.status}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-xs">
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
                            <td colSpan={8} className="px-6 py-4 text-center text-xs text-gray-500">
                              No referrals found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Row */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-6">
                        <span style={{ color: '#101828' }}><strong>{totalReferrals} total referrals</strong></span>
                        <span style={{ color: '#717182' }}>Doctor: <strong>{doctorReferrals.length}</strong></span>
                        <span style={{ color: '#717182' }}>Direct: <strong>{directReferrals.length}</strong></span>
                        <span style={{ color: '#717182' }}>Walk-in: <strong>{walkInReferrals.length}</strong></span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <span style={{ color: '#101828' }}>Active Doctors: <strong className="text-xs">{totalActiveDoctors}</strong></span>
                        <span style={{ color: '#717182' }}>Revenue: <strong>{totalRevenue}</strong></span>
                        <span style={{ color: '#717182' }}>Commission: <strong>{totalCommissions}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="bg-white px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Showing 1 to {Math.min(referralData.length, 4)} of {referralData.length}</span>
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
                    <h2 className="text-sm" style={{ color: '#101828' }}>Commission Statements</h2>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">{commissionStatementsData.length}</span>
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
                        {commissionStatementsData.map((statement) => (
                          <tr key={statement.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-medium" style={{ color: '#101828' }}>{statement.doctor}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs" style={{ color: '#101828' }}>{statement.period}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs" style={{ color: '#101828' }}>{statement.referrals}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-medium" style={{ color: '#101828' }}>{statement.revenue}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs" style={{ color: '#717182' }}>{statement.commission}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                statement.status === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>{statement.status}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs" style={{ color: '#101828' }}>{statement.dueDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs">
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
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-6">
                        <span style={{ color: '#101828' }}><strong>Total</strong></span>
                        <span style={{ color: '#717182' }}>Statements: <strong>{commissionStatementsData.length} statements</strong></span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <span style={{ color: '#101828' }}>Total Referrals: <strong className="text-xs">{totalDoctorReferrals}</strong></span>
                        <span style={{ color: '#101828' }}>Total Revenue: <strong className="text-xs">{totalRevenue}</strong></span>
                        <span className="text-green-600 font-medium">Total Commission: <strong className="text-xs">{totalCommissions}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="bg-white px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Showing 1 to {commissionStatementsData.length} of {commissionStatementsData.length}</span>
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
