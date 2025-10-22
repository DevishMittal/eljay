'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { useAuth } from '@/contexts/AuthContext';
import { OrganizationRole } from '@/types';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DashboardService, DashboardAppointmentsData, DashboardDoctorReferralData, DashboardDiagnosticsData, DashboardBillingsData, DashboardInventoryData, DashboardHearingAidData } from '@/services/dashboardService';
import { RoleBasedDashboardService } from '@/services/roleBasedDashboardService';
import { SuperAdminDashboardData } from '@/services/superAdminDashboardService';
import { useBranch } from '@/contexts/BranchContext';
import { AuthService } from '@/services/authService';
// Remove Switch import - we'll create a segmented control instead
import RevenueAnalytics from '@/components/dashboard/superadmin/RevenueAnalytics';
import PerformanceMetrics from '@/components/dashboard/superadmin/PerformanceMetrics';
import Operations from '@/components/dashboard/superadmin/Operations';
import BusinessIntelligence from '@/components/dashboard/superadmin/BusinessIntelligence';

export default function DashboardPage() {
  const { organization, hasRole } = useAuth();
  const { selectedBranch } = useBranch();
  const [activeTab, setActiveTab] = useState('appointments');
  const [activeSuperAdminTab, setActiveSuperAdminTab] = useState('revenue-analytics');
  const [timeFilter, setTimeFilter] = useState('Last 30 Days');
  
  // Role-based view logic
  const isSuperAdmin = hasRole(OrganizationRole.SuperAdmin);
  const [isSuperAdminView, setIsSuperAdminView] = useState(false);

  // Ensure non-SuperAdmin users can't access SuperAdmin view
  useEffect(() => {
    if (!isSuperAdmin && isSuperAdminView) {
      setIsSuperAdminView(false);
    }
  }, [isSuperAdmin, isSuperAdminView]);
  const [appointmentsData, setAppointmentsData] = useState<DashboardAppointmentsData | null>(null);
  const [doctorReferralData, setDoctorReferralData] = useState<DashboardDoctorReferralData | null>(null);
  const [diagnosticsData, setDiagnosticsData] = useState<DashboardDiagnosticsData | null>(null);
  const [billingsData, setBillingsData] = useState<DashboardBillingsData | null>(null);
  const [inventoryData, setInventoryData] = useState<DashboardInventoryData | null>(null);
  const [hearingAidData, setHearingAidData] = useState<DashboardHearingAidData | null>(null);
  const [superAdminData, setSuperAdminData] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Time filter options for the dropdown
  const timeFilterOptions = [
    { value: 'Last 7 Days', label: 'Last 7 Days' },
    { value: 'Last 30 Days', label: 'Last 30 Days' },
    { value: 'Last 90 Days', label: 'Last 90 Days' },
    { value: 'This Year', label: 'This Year' }
  ];

  // Role-based tabs configuration
  const getAvailableTabs = () => {
    const allTabs = [
      { id: 'appointments', label: 'Appointments' },
      { id: 'doctor-referral', label: 'Doctor Referral' },
      { id: 'diagnostics', label: 'Diagnostics' },
      // { id: 'hearing-aid', label: 'Hearing Aid' },
      { id: 'billings', label: 'Billings' },
      { id: 'inventory', label: 'Inventory' }
    ];

    // Role-based tab filtering
    if (hasRole(OrganizationRole.SuperAdmin)) {
      return allTabs; // SuperAdmin can see all tabs
    } else if (hasRole(OrganizationRole.Admin)) {
      return allTabs; // Admin can see all tabs
    } else if (hasRole([OrganizationRole.Receptionist, OrganizationRole.AdministrativeStaff])) {
      return allTabs.filter(tab => 
        ['appointments', 'doctor-referral', 'billings'].includes(tab.id)
      );
    } else if (hasRole(OrganizationRole.Audiologist)) {
      return allTabs.filter(tab => 
        ['appointments', 'diagnostics', 'hearing-aid'].includes(tab.id)
      );
    } else if (hasRole(OrganizationRole.Technician)) {
      return allTabs.filter(tab => 
        ['inventory', 'diagnostics'].includes(tab.id)
      );
    }
    
    return []; // Default fallback
  };

  const tabs = getAvailableTabs();

  // SuperAdmin tabs configuration
  const superAdminTabs = [
    { id: 'revenue-analytics', label: 'Revenue Analytics' },
    { id: 'performance-metrics', label: 'Performance Metrics' },
    { id: 'operations', label: 'Operations' },
    { id: 'business-intelligence', label: 'Business Intelligence' }
  ];

  // Get date range based on time filter
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeFilter) {
      case 'Last 7 Days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'Last 30 Days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'Last 90 Days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case 'This Year':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Fetch appointments data
  const fetchAppointmentsData = async () => {
    if (activeTab !== 'appointments') return;
    
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getDateRange();
      console.log('Fetching appointments data for:', { startDate, endDate, timeFilter });
      const data = await DashboardService.getAppointmentsData(startDate, endDate, isSuperAdmin ? selectedBranch?.id : null);
      console.log('Appointments data received:', data);
      setAppointmentsData(data);
    } catch (error) {
      console.error('Error fetching appointments data:', error);
      setError('Failed to fetch appointments data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctor referral data
  const fetchDoctorReferralData = async () => {
    if (activeTab !== 'doctor-referral') return;
    
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getDateRange();
      console.log('Fetching doctor referral data for:', { startDate, endDate, timeFilter });
      const data = await DashboardService.getDoctorReferralData(startDate, endDate, isSuperAdmin ? selectedBranch?.id : null);
      console.log('Doctor referral data received:', data);
      setDoctorReferralData(data);
    } catch (error) {
      console.error('Error fetching doctor referral data:', error);
      setError('Failed to fetch doctor referral data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch diagnostics data
  const fetchDiagnosticsData = async () => {
    if (activeTab !== 'diagnostics') return;
    
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getDateRange();
      console.log('Fetching diagnostics data for:', { startDate, endDate, timeFilter });
      const data = await DashboardService.getDiagnosticsData(startDate, endDate, isSuperAdmin ? selectedBranch?.id : null);
      console.log('Diagnostics data received:', data);
      setDiagnosticsData(data);
    } catch (error) {
      console.error('Error fetching diagnostics data:', error);
      setError('Failed to fetch diagnostics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch billings data
  const fetchBillingsData = async () => {
    if (activeTab !== 'billings') return;
    
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getDateRange();
      console.log('Fetching billings data for:', { startDate, endDate, timeFilter });
      const data = await DashboardService.getBillingsData(startDate, endDate, isSuperAdmin ? selectedBranch?.id : null);
      console.log('Billings data received:', data);
      setBillingsData(data);
    } catch (error) {
      console.error('Error fetching billings data:', error);
      setError('Failed to fetch billings data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory data
  const fetchInventoryData = async () => {
    if (activeTab !== 'inventory') return;
    
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getDateRange();
      console.log('Fetching inventory data for:', { startDate, endDate, timeFilter });
      const data = await DashboardService.getInventoryData(startDate, endDate, isSuperAdmin ? selectedBranch?.id : null);
      console.log('Inventory data received:', data);
      setInventoryData(data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setError('Failed to fetch inventory data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch hearing aid data
  const fetchHearingAidData = async () => {
    if (activeTab !== 'hearing-aid') return;
    
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getDateRange();
      console.log('Fetching hearing aid data for:', { startDate, endDate, timeFilter });
      const data = await DashboardService.getHearingAidData(startDate, endDate, isSuperAdmin ? selectedBranch?.id : null);
      console.log('Hearing aid data received:', data);
      setHearingAidData(data);
    } catch (error) {
      console.error('Error fetching hearing aid data:', error);
      setError('Failed to fetch hearing aid data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch SuperAdmin dashboard data
  const fetchSuperAdminData = async () => {
    if (!isSuperAdminView) return;
    
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getDateRange();
      console.log('Fetching SuperAdmin data for:', { startDate, endDate, timeFilter });
      
      const { token } = AuthService.getAuthData();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Fetch all sections individually and combine the data
      const [revenueData, performanceData, operationsData, businessIntelligenceData] = await Promise.all([
        RoleBasedDashboardService.getSuperAdminDashboard(token, ['revenueAnalytics'], startDate, endDate),
        RoleBasedDashboardService.getSuperAdminDashboard(token, ['performanceMetrics'], startDate, endDate),
        RoleBasedDashboardService.getSuperAdminDashboard(token, ['operations'], startDate, endDate),
        RoleBasedDashboardService.getSuperAdminDashboard(token, ['businessIntelligence'], startDate, endDate)
      ]);
      
      // Combine the data
      const combinedData = {
        revenueAnalytics: revenueData.data?.revenueAnalytics,
        performanceMetrics: performanceData.data?.performanceMetrics,
        operations: operationsData.data?.operations,
        businessIntelligence: businessIntelligenceData.data?.businessIntelligence,
      };
      
      console.log('SuperAdmin data received:', combinedData);
      setSuperAdminData(combinedData);
    } catch (error) {
      console.error('Error fetching SuperAdmin data:', error);
      setError('Failed to fetch SuperAdmin dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when tab changes or time filter changes
  useEffect(() => {
    if (isSuperAdminView) {
      fetchSuperAdminData();
    } else {
      if (activeTab === 'appointments') {
        fetchAppointmentsData();
      } else if (activeTab === 'doctor-referral') {
        fetchDoctorReferralData();
      } else if (activeTab === 'diagnostics') {
        fetchDiagnosticsData();
      } else if (activeTab === 'billings') {
        fetchBillingsData();
      } else if (activeTab === 'inventory') {
        fetchInventoryData();
      } else if (activeTab === 'hearing-aid') {
        fetchHearingAidData();
      }
    }
  }, [activeTab, timeFilter, isSuperAdminView]);

  // Debug logging
  useEffect(() => {
    if (appointmentsData) {
      console.log('Appointments data loaded:', appointmentsData);
    }
  }, [appointmentsData]);

  // Transform API data for charts
  const transformAppointmentsData = () => {
    if (!appointmentsData) return null;

    try {
      // Appointment Status Distribution
      const appointmentStatusData = [
        { name: 'Completed', value: appointmentsData.statusDistribution?.COMPLETED || 0, color: '#10B981' },
        { name: 'Pending', value: appointmentsData.statusDistribution?.PENDING || 0, color: '#F59E0B' },
        { name: 'Cancelled', value: appointmentsData.statusDistribution?.CANCELLED || 0, color: '#EF4444' },
        { name: 'No Show', value: appointmentsData.statusDistribution?.NO_SHOW || 0, color: '#8B5CF6' }
      ].filter(item => item.value > 0);

      // Appointment Trends (Last 6 Months)
      const appointmentTrendsData = (appointmentsData.trends?.lastSixMonths || []).map(item => ({
        month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
        total: item.count,
        completed: item.count, // Assuming all are completed for now
        cancelled: 0
      }));

      // Audiologist Performance
      const audiologistPerformanceData = (appointmentsData.audiologistPerformance || []).map(item => ({
        name: item.audiologistName,
        appointments: item.count
      }));

      // Channel Distribution
      const channelDistributionData = (appointmentsData.channelDistribution || []).map(item => ({
        name: item.name,
        value: item.count,
        color: item.referralSourceId ? '#10B981' : '#3B82F6'
      }));

      // Attendance Rate Data
      const attendanceRateData = (appointmentsData.trends?.attendanceRate || []).map(item => ({
        month: item.monthLabel,
        rate: item.attendanceRate,
        target: item.target
      }));

      // Booking Lead Time Distribution
      const bookingLeadTimeData = Object.entries(appointmentsData.leadTimeHistogram || {}).map(([range, count]) => ({
        range,
        count
      }));

      return {
        appointmentStatusData,
        appointmentTrendsData,
        audiologistPerformanceData,
        channelDistributionData,
        attendanceRateData,
        bookingLeadTimeData
      };
    } catch (error) {
      console.error('Error transforming appointments data:', error);
      return null;
    }
  };

  const chartData = transformAppointmentsData();

  // Use real data from API or fallback to empty data
  const getAppointmentStatusData = () => {
    if (chartData?.appointmentStatusData && chartData.appointmentStatusData.length > 0) {
      return chartData.appointmentStatusData;
    }
    return [
      { name: 'Completed', value: 0, color: '#10B981' },
      { name: 'Pending', value: 0, color: '#F59E0B' },
      { name: 'Cancelled', value: 0, color: '#EF4444' }
    ];
  };

  const getAppointmentTrendsData = () => {
    if (chartData?.appointmentTrendsData && chartData.appointmentTrendsData.length > 0) {
      return chartData.appointmentTrendsData;
    }
    return [
      { month: 'No Data', total: 0, completed: 0, cancelled: 0 }
    ];
  };

  const getAudiologistPerformanceData = () => {
    if (chartData?.audiologistPerformanceData && chartData.audiologistPerformanceData.length > 0) {
      return chartData.audiologistPerformanceData;
    }
    return [
      { name: 'No Data', appointments: 0 }
    ];
  };

  const getChannelDistributionData = () => {
    if (chartData?.channelDistributionData && chartData.channelDistributionData.length > 0) {
      return chartData.channelDistributionData;
    }
    return [
      { name: 'No Data', value: 0, color: '#E5E7EB' }
    ];
  };

  const getAttendanceRateData = () => {
    if (chartData?.attendanceRateData && chartData.attendanceRateData.length > 0) {
      return chartData.attendanceRateData;
    }
    return [
      { month: 'No Data', rate: 0, target: 85 }
    ];
  };

  const getBookingLeadTimeData = () => {
    if (chartData?.bookingLeadTimeData && chartData.bookingLeadTimeData.length > 0) {
      return chartData.bookingLeadTimeData;
    }
    return [
      { range: 'No Data', count: 0 }
    ];
  };

  // Doctor Referral Data - Use real data from API
  const getReferralSourceData = () => {
    if (doctorReferralData?.doctorPerformance && doctorReferralData.doctorPerformance.length > 0) {
      // Group by specialization
      const specializationCounts: { [key: string]: number } = {};
      doctorReferralData.doctorPerformance.forEach(doctor => {
        specializationCounts[doctor.specialization] = (specializationCounts[doctor.specialization] || 0) + doctor.totalReferrals;
      });
      
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
      return Object.entries(specializationCounts).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));
    }
    return [{ name: 'No Data', value: 0, color: '#E5E7EB' }];
  };

  const getReferralTrendsData = () => {
    // Since we don't have historical data in the API response, we'll show current data
    if (doctorReferralData?.overview) {
      return [
        { month: 'Current', referrals: doctorReferralData.overview.referrals, conversions: doctorReferralData.overview.converted, revenue: doctorReferralData.financialImpact.revenueGenerated }
      ];
    }
    return [{ month: 'No Data', referrals: 0, conversions: 0, revenue: 0 }];
  };

  const getTopReferringDoctorsData = () => {
    if (doctorReferralData?.topPerformers?.topDoctors && doctorReferralData.topPerformers.topDoctors.length > 0) {
      return doctorReferralData.topPerformers.topDoctors
        .slice(0, 5)
        .map(doctor => ({
          name: doctor.doctorName,
          referrals: doctor.referrals,
          conversions: Math.round(doctor.referrals * (doctor.conversionRate / 100)),
          revenue: Math.round(doctor.referrals * (doctor.conversionRate / 100) * (doctorReferralData.financialImpact.revenueGenerated / doctorReferralData.overview.converted))
        }));
    }
    return [{ name: 'No Data', referrals: 0, conversions: 0, revenue: 0 }];
  };

  const getReferralConversionData = () => {
    if (doctorReferralData?.referralFlow) {
      const flow = doctorReferralData.referralFlow;
      return [
        { status: 'Referred', count: flow.referred, color: '#3B82F6' },
        { status: 'Scheduled', count: flow.appointed, color: '#10B981' },
        { status: 'Completed', count: flow.completed, color: '#22C55E' },
        { status: 'Converted', count: flow.converted, color: '#8B5CF6' }
      ].filter(item => item.count > 0);
    }
    return [{ status: 'No Data', count: 0, color: '#E5E7EB' }];
  };


  // Hearing Aid Data - will be fetched from API

  // Billings Data
  const revenueBreakdownData = [
    { name: 'Diagnostic Services', revenue: 190, percentage: 50.0, color: '#3B82F6' },
    { name: 'Hearing Aid Sales', revenue: 140, percentage: 35.0, color: '#10B981' },
    { name: 'Follow-up Care', revenue: 38.7, percentage: 10.0, color: '#F59E0B' },
    { name: 'Accessories', revenue: 19.4, percentage: 5.0, color: '#8B5CF6' }
  ];

  const paymentMethodData = [
    { name: 'Cash', amount: 163800, percentage: 45, color: '#3B82F6' },
    { name: 'Card', amount: 127400, percentage: 35, color: '#10B981' },
    { name: 'UPI', amount: 54600, percentage: 15, color: '#F59E0B' },
    { name: 'Bank Transfer', amount: 18200, percentage: 5, color: '#8B5CF6' }
  ];

  const customerAgeData = [
    { name: '18-30 years', patients: 12, percentage: 7.7, color: '#3B82F6' },
    { name: '31-45 years', patients: 28, percentage: 17.9, color: '#10B981' },
    { name: '46-60 years', patients: 45, percentage: 28.8, color: '#F59E0B' },
    { name: '61-75 years', patients: 52, percentage: 33.3, color: '#8B5CF6' },
    { name: '75+ years', patients: 19, percentage: 12.2, color: '#EF4444' }
  ];

  const revenueCollectionTrendData = [
    { month: 'Jan', revenue: 280, collection: 265 },
    { month: 'Feb', revenue: 320, collection: 305 },
    { month: 'Mar', revenue: 350, collection: 335 },
    { month: 'Apr', revenue: 380, collection: 365 },
    { month: 'May', revenue: 375, collection: 360 },
    { month: 'Jun', revenue: 390, collection: 375 }
  ];

  const collectionTimelineData = [
    { timeline: 'Same Day', percentage: 85, color: '#10B981' },
    { timeline: 'Within 7 Days', percentage: 92, color: '#3B82F6' },
    { timeline: 'Within 30 Days', percentage: 96, color: '#8B5CF6' }
  ];

  // Inventory Data
  const currentStockStatusData = [
    { name: 'In Stock', value: 75, color: '#10B981' },
    { name: 'Low Stock', value: 15, color: '#F59E0B' },
    { name: 'Out of Stock', value: 8, color: '#EF4444' },
    { name: 'Expiring Soon', value: 2, color: '#8B5CF6' }
  ];

  const stockLevelTrendData = [
    { month: 'Jan', accessories: 650, hearingAids: 100 },
    { month: 'Feb', accessories: 680, hearingAids: 105 },
    { month: 'Mar', accessories: 720, hearingAids: 110 },
    { month: 'Apr', accessories: 750, hearingAids: 115 },
    { month: 'May', accessories: 730, hearingAids: 120 },
    { month: 'Jun', accessories: 700, hearingAids: 118 }
  ];

  const bestSellingBrandsData = [
    { name: 'Phonak', sales: 145, color: '#3B82F6' },
    { name: 'Oticon', sales: 125, color: '#10B981' },
    { name: 'Widex', sales: 85, color: '#F59E0B' },
    { name: 'Signia', sales: 65, color: '#8B5CF6' },
    { name: 'ReSound', sales: 15, color: '#EF4444' }
  ];

  const stockoutFrequencyData = [
    { item: 'Size 312 Batteries', frequency: 8, color: '#F59E0B' },
    { item: 'BTE Receivers', frequency: 5, color: '#10B981' },
    { item: 'Wax Guards', frequency: 10, color: '#EF4444' },
    { item: 'ITE Shells', frequency: 2, color: '#10B981' },
    { item: 'Cleaning Tools', frequency: 7, color: '#F59E0B' },
    { item: 'Size 13 Batteries', frequency: 6, color: '#F59E0B' }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: '#101828' }}>Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: '#717182' }}>
              {isSuperAdmin && isSuperAdminView 
                ? "Welcome back! Here's your SuperAdmin analytics overview."
                : `Welcome back, ${organization?.name || 'User'}! Here's what's happening at ${organization?.branchName || 'your branch'}.`
              }
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Branch/Super Admin Toggle - Only visible to SuperAdmin */}
            {isSuperAdmin && (
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setIsSuperAdminView(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    !isSuperAdminView
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Branch
                </button>
                <button
                  onClick={() => setIsSuperAdminView(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    isSuperAdminView
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Super Admin
                </button>
              </div>
            )}
            
            {/* Date Filter */}
            <div className="flex items-center space-x-2 px-4 py-3  rounded-lg bg-white relative">
              {/* <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg> */}
              <CustomDropdown
                options={timeFilterOptions}
                value={timeFilter}
                onChange={setTimeFilter}
                placeholder="Select time period"
                className="text-sm border-none outline-none bg-transparent"
                aria-label="Select time period"
              />
            </div>
            
            {/* Filters Button */}
            {/* <button className="flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </button> */}
          </div>
        </div>

        {/* Navigation Tabs - Only show in normal view or for non-SuperAdmin users */}
        {(!isSuperAdmin || !isSuperAdminView) && (
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
        )}

        {/* SuperAdmin Navigation Tabs - Only show in SuperAdmin view and for SuperAdmin users */}
        {isSuperAdmin && isSuperAdminView && (
          <div className="bg-[#ECECF0] rounded-full p-1 mb-6">
            <div className="flex">
              {superAdminTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSuperAdminTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-full flex-1 justify-center ${
                    activeSuperAdminTab === tab.id
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
        )}

        {/* SuperAdmin Dashboard Content - Only accessible to SuperAdmin users */}
        {isSuperAdmin && isSuperAdminView && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            ) : superAdminData ? (
              <>
                {/* Revenue Analytics Tab */}
                {activeSuperAdminTab === 'revenue-analytics' && superAdminData.revenueAnalytics && (
                  <RevenueAnalytics data={{
                    hearingAidRevenueByCentre: superAdminData.revenueAnalytics.hearingAidRevenueByCentre,
                    diagnosticsRevenueByCentre: superAdminData.revenueAnalytics.diagnosticsRevenueByCentre,
                    branchPerformanceStats: superAdminData.revenueAnalytics.branchPerformanceStats,
                    hearingAidVolumeByBranch: superAdminData.revenueAnalytics.hearingAidVolumeByBranch,
                    hearingAidRevenueByBranch: superAdminData.revenueAnalytics.hearingAidRevenueByBranch,
                  }} />
                )}

                {/* Performance Metrics Tab */}
                {activeSuperAdminTab === 'performance-metrics' && (
                  superAdminData.performanceMetrics ? (
                    <PerformanceMetrics data={superAdminData.performanceMetrics} />
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Performance Metrics
                      </h3>
                      <p className="text-sm text-gray-600">
                        No performance metrics data available for the selected time period.
                      </p>
                    </div>
                  )
                )}
                
                      {/* Operations Tab */}
                      {activeSuperAdminTab === 'operations' && (
                        superAdminData.operations ? (
                          <Operations data={superAdminData.operations} />
                        ) : (
                          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Operations
                            </h3>
                            <p className="text-sm text-gray-600">
                              No operations data available for the selected time period.
                            </p>
                          </div>
                        )
                      )}
                
                {/* Business Intelligence Tab */}
                {activeSuperAdminTab === 'business-intelligence' && (
                  superAdminData.businessIntelligence ? (
                    <BusinessIntelligence data={superAdminData.businessIntelligence} />
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Business Intelligence
                      </h3>
                      <p className="text-sm text-gray-600">
                        No business intelligence data available for the selected time period.
                      </p>
                    </div>
                  )
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  SuperAdmin Dashboard
                </h3>
                <p className="text-sm text-gray-600">
                  No data available for the selected time period.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Dashboard Content - Show for non-SuperAdmin users or when not in SuperAdmin view */}
        {(!isSuperAdmin || !isSuperAdminView) && activeTab === 'appointments' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading appointments data...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-red-600 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button 
                    onClick={fetchAppointmentsData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : !appointmentsData ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">No appointments data available for the selected period.</p>
                  <button 
                    onClick={fetchAppointmentsData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Top Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Appointments Overview */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Appointments Overview</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        {appointmentsData?.overview.total || 0}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>
                        Total appointments in selected period.
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          {appointmentsData?.overview.completionRate || 0}% completed
                        </span>
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {appointmentsData?.performance.targetAchievement ? 
                            `${Math.round(appointmentsData.performance.targetAchievement)}% of target` : 
                            'Target achieved'
                          }
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${appointmentsData?.overview.completionRate || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{appointmentsData?.overview.completed || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>COMPLETED</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{appointmentsData?.overview.pending || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>PENDING</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{appointmentsData?.overview.cancelled || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>CANCELLED</div>
                      </div>
                    </div>
                  </div>

              {/* Performance */}
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Performance</h3>
                  <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold" style={{ color: '#101828' }}>
                      {appointmentsData?.performance.attendanceRate || 0}%
                    </div>
                    <div className="text-xs" style={{ color: '#717182' }}>ATTENDANCE RATE</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold" style={{ color: '#101828' }}>
                      {Math.round(appointmentsData?.performance.repeatPatients || 0)}%
                    </div>
                    <div className="text-xs" style={{ color: '#717182' }}>REPEAT PATIENTS</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold" style={{ color: '#101828' }}>
                      {appointmentsData?.performance.noShowRate || 0}%
                    </div>
                    <div className="text-xs" style={{ color: '#717182' }}>NO-SHOW RATE</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold" style={{ color: '#101828' }}>
                      {appointmentsData?.performance.avgLeadDays ? 
                        appointmentsData.performance.avgLeadDays.toFixed(1) : 0}
                    </div>
                    <div className="text-xs" style={{ color: '#717182' }}>AVG LEAD DAYS</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span style={{ color: '#717182' }}>
                      {appointmentsData?.performance.attendanceRate || 0}% of target
                    </span>
                    <span style={{ color: '#717182' }}>Target: 85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((appointmentsData?.performance.attendanceRate || 0), 100)}%` }}
                    ></div>
                  </div>
                  <div className={`text-sm mt-1 ${
                    (appointmentsData?.performance.attendanceRate || 0) >= 85 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {(appointmentsData?.performance.attendanceRate || 0) >= 85 ? 'Target achieved' : 'Below target'}
                  </div>
                </div>
              </div>

              {/* Utilization Rate */}
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Utilization Rate</h3>
                  <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                    {appointmentsData?.utilization.overall || 0}%
                  </div>
                  <div className="text-sm mb-2" style={{ color: '#717182' }}>Overall</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${appointmentsData?.utilization.overall || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold" style={{ color: '#101828' }}>
                      {appointmentsData?.utilization.audiologistAvg || 0}%
                    </div>
                    <div className="text-xs" style={{ color: '#717182' }}>AUDIOLOGIST AVG</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold" style={{ color: '#101828' }}>
                      {appointmentsData?.utilization.peakHour || 0}
                    </div>
                    <div className="text-xs" style={{ color: '#717182' }}>PEAK HOUR</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#717182' }}>Optimal: 80-85%</span>
                  <div className="flex items-center text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    {appointmentsData?.utilization.overall ? 
                      `${appointmentsData.utilization.overall >= 80 ? 'Optimal' : 'Below optimal'}` : 
                      'No data'
                    }
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm mr-2" style={{ color: '#717182' }}>Resource efficiency</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    (appointmentsData?.utilization.overall || 0) >= 80 ? 
                      'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'
                  }`}>
                    {(appointmentsData?.utilization.overall || 0) >= 80 ? 'Optimal' : 'Low'}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointment Status Distribution */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Appointment Status Distribution</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>{timeFilter} breakdown</p>
                {getAppointmentStatusData().some(item => item.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getAppointmentStatusData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getAppointmentStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p>No status distribution data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Appointment Trends */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Appointment Trends (6 Months)</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>Monthly performance tracking</p>
                {getAppointmentTrendsData().some(item => item.total > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getAppointmentTrendsData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="completed" stroke="#10B981" />
                      <Line type="monotone" dataKey="cancelled" stroke="#EF4444" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p>No trends data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Audiologist Performance */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Audiologist Performance</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>{timeFilter} appointments handled</p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getAudiologistPerformanceData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Channel Distribution */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Channel Distribution</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>Referral channel breakdown</p>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={getChannelDistributionData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getChannelDistributionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Booking Lead Time Distribution */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Booking Lead Time Distribution</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>Days between booking and appointment</p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getBookingLeadTimeData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attendance Rate Trend */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Attendance Rate Trend</h3>
              <p className="text-sm mb-4" style={{ color: '#717182' }}>Performance vs target (85%)</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getAttendanceRateData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[75, 95]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rate" stroke="#3B82F6" name="Performance" />
                  <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </div>
              </>
            )}
          </div>
        )}

        {(!isSuperAdmin || !isSuperAdminView) && activeTab === 'doctor-referral' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading doctor referral data...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-red-600 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button 
                    onClick={fetchDoctorReferralData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : !doctorReferralData ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">No doctor referral data available for the selected period.</p>
                  <button 
                    onClick={fetchDoctorReferralData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Key Metrics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Total Referrals */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Total Referrals</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        {doctorReferralData?.overview.referrals || 0}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Total referrals received in selected period.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          {doctorReferralData?.overview.conversionRate || 0}% conversion rate
                        </span>
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {doctorReferralData?.overview.conversionRateChange ? 
                            `${doctorReferralData.overview.conversionRateChange > 0 ? '+' : ''}${doctorReferralData.overview.conversionRateChange}% vs last period` : 
                            'No comparison data'
                          }
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(doctorReferralData?.overview.conversionRate || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{doctorReferralData?.overview.converted || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>CONVERTED</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{doctorReferralData?.overview.referrals - doctorReferralData?.overview.converted || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>PENDING</div>
                      </div>
                    </div>
                  </div>

                  {/* Conversion Rate */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Conversion Rate</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        {doctorReferralData?.overview.conversionRate || 0}%
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Referrals converted to appointments.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          {doctorReferralData?.overview.converted || 0} out of {doctorReferralData?.overview.referrals || 0} referrals
                        </span>
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {doctorReferralData?.overview.conversionRateChange ? 
                            `${doctorReferralData.overview.conversionRateChange > 0 ? '+' : ''}${doctorReferralData.overview.conversionRateChange}% vs last period` : 
                            'No comparison data'
                          }
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(doctorReferralData?.overview.conversionRate || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{doctorReferralData?.referralFlow.completed || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>COMPLETED</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{doctorReferralData?.referralFlow.referred - doctorReferralData?.referralFlow.completed || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>NO SHOW</div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Generated */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Revenue Generated</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        ₹{doctorReferralData?.financialImpact.revenueGenerated?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Revenue from referral patients.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          ₹{doctorReferralData?.overview.converted ? Math.round(doctorReferralData.financialImpact.revenueGenerated / doctorReferralData.overview.converted).toLocaleString() : 0} avg per patient
                        </span>
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {doctorReferralData?.financialImpact.revenueChange ? 
                            `${doctorReferralData.financialImpact.revenueChange > 0 ? '+' : ''}${doctorReferralData.financialImpact.revenueChange}% vs last period` : 
                            'No comparison data'
                          }
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '87.5%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">₹{Math.round((doctorReferralData?.financialImpact.revenueGenerated || 0) * 0.9).toLocaleString()}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>COLLECTED</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">₹{Math.round((doctorReferralData?.financialImpact.revenueGenerated || 0) * 0.1).toLocaleString()}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>PENDING</div>
                      </div>
                    </div>
                  </div>

                  {/* Active Referral Partners */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Active Partners</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        {doctorReferralData?.overview.activeDoctors || 0}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Active referring doctors.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          {doctorReferralData?.overview.avgPerDoctor || 0} avg referrals per doctor
                        </span>
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {doctorReferralData?.overview.newDoctors ? `+${doctorReferralData.overview.newDoctors} new partners` : 'No new partners'}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {doctorReferralData?.doctorPerformance?.filter(d => d.specialization === 'ENT').length || 0}
                        </div>
                        <div className="text-xs" style={{ color: '#717182' }}>ENT SPECIALISTS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {doctorReferralData?.doctorPerformance?.filter(d => d.specialization !== 'ENT').length || 0}
                        </div>
                        <div className="text-xs" style={{ color: '#717182' }}>OTHERS</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Referral Sources */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Referral Sources</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Breakdown of new patients by referral source</p>
                    {getReferralSourceData().some(item => item.value > 0) ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={getReferralSourceData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {getReferralSourceData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-gray-500">
                        <div className="text-center">
                          <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p>No referral source data available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Referral Trends */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Referral Trends</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Current period performance</p>
                    {getReferralTrendsData().some(item => item.referrals > 0) ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={getReferralTrendsData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="referrals" stroke="#3B82F6" strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="conversions" stroke="#10B981" />
                          <Line type="monotone" dataKey="revenue" stroke="#F59E0B" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-gray-500">
                        <div className="text-center">
                          <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p>No trends data available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Top Referring Doctors */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Top Referring Doctors</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Current period&apos;s top performers</p>
                    {getTopReferringDoctorsData().some(item => item.referrals > 0) ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={getTopReferringDoctorsData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="referrals" fill="#3B82F6" />
                          <Bar dataKey="conversions" fill="#10B981" />
                          <Bar dataKey="revenue" fill="#F59E0B" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-gray-500">
                        <div className="text-center">
                          <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p>No doctor performance data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Referral Conversion Status */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Referral Conversion Status</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Current period breakdown</p>
                    {getReferralConversionData().some(item => item.count > 0) ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={getReferralConversionData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                          >
                            {getReferralConversionData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-gray-500">
                        <div className="text-center">
                          <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p>No conversion data available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Commission Distribution */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Commission Distribution</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Commission breakdown by service</p>
                    {doctorReferralData?.commissionDistribution?.distribution && doctorReferralData.commissionDistribution.distribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={doctorReferralData.commissionDistribution.distribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="amount"
                          >
                            {doctorReferralData.commissionDistribution.distribution.map((entry: { service: string; amount: number; percentage: number }, index: number) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-gray-500">
                        <div className="text-center">
                          <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p>No commission data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row - Financial Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Commission Summary */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Commission Summary</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Total commission paid to doctors</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium" style={{ color: '#101828' }}>Total Commission</div>
                          <div className="text-xs" style={{ color: '#717182' }}>Paid to referring doctors</div>
                        </div>
                        <div className="text-lg font-bold text-green-600">₹{doctorReferralData?.commissionDistribution?.totalCommission || 0}</div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium" style={{ color: '#101828' }}>Commission Rate</div>
                          <div className="text-xs" style={{ color: '#717182' }}>Percentage of revenue</div>
                        </div>
                        <div className="text-lg font-bold text-blue-600">{doctorReferralData?.financialImpact?.commissionRate || 0}%</div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800">
                        Commission per referral: ₹{doctorReferralData?.overview?.referrals ? Math.round((doctorReferralData.commissionDistribution?.totalCommission || 0) / doctorReferralData.overview.referrals) : 0}
                      </div>
                      <div className="text-xs text-green-600">Based on current period data</div>
                    </div>
                  </div>

                  {/* Financial Impact */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Financial Impact</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Revenue and discount analysis</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium" style={{ color: '#101828' }}>Revenue Generated</div>
                          <div className="text-xs" style={{ color: '#717182' }}>From referral patients</div>
                        </div>
                        <div className="text-lg font-bold text-green-600">₹{doctorReferralData?.financialImpact?.revenueGenerated?.toLocaleString() || 0}</div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium" style={{ color: '#101828' }}>Patient Discounts</div>
                          <div className="text-xs" style={{ color: '#717182' }}>Discounts given to patients</div>
                        </div>
                        <div className="text-lg font-bold text-orange-600">₹{doctorReferralData?.financialImpact?.patientDiscounts || 0}</div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">
                        Net Revenue: ₹{((doctorReferralData?.financialImpact?.revenueGenerated || 0) - (doctorReferralData?.financialImpact?.patientDiscounts || 0)).toLocaleString()}
                      </div>
                      <div className="text-xs text-blue-600">After discounts and commissions</div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Performance Metrics</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Key performance indicators</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium" style={{ color: '#101828' }}>Best Conversion Rate</div>
                          <div className="text-xs" style={{ color: '#717182' }}>Top performing doctor</div>
                        </div>
                        <div className="text-lg font-bold text-green-600">{doctorReferralData?.topPerformers?.bestRate || 0}%</div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium" style={{ color: '#101828' }}>Average Conversion</div>
                          <div className="text-xs" style={{ color: '#717182' }}>Across all doctors</div>
                        </div>
                        <div className="text-lg font-bold text-blue-600">{doctorReferralData?.topPerformers?.avgConversion || 0}%</div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium text-purple-800">
                        Drop-off Rate: {doctorReferralData?.referralFlow?.totalDropOff || 0}%
                      </div>
                      <div className="text-xs text-purple-600">Patients who didn&apos;t complete the process</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {(!isSuperAdmin || !isSuperAdminView) && activeTab === 'diagnostics' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading diagnostics data...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-red-600 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button 
                    onClick={fetchDiagnosticsData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : !diagnosticsData ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">No diagnostics data available for the selected period.</p>
                  <button 
                    onClick={fetchDiagnosticsData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Key Metrics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Tests Completed */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Tests Completed</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        {diagnosticsData?.overview.testsCompleted || 0}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Total tests completed in selected period.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          {diagnosticsData?.metrics.completionRate || 0}% completion rate
                        </span>
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {diagnosticsData?.overview.testsCompletedChange ? 
                            `${diagnosticsData.overview.testsCompletedChange > 0 ? '+' : ''}${diagnosticsData.overview.testsCompletedChange}% vs last period` : 
                            'No comparison data'
                          }
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(diagnosticsData?.metrics.completionRate || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{diagnosticsData?.overview.testsCompleted || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>COMPLETED</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{diagnosticsData?.overview.pendingTests || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>PENDING</div>
                      </div>
                    </div>
                  </div>

                  {/* Pending Tests */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Pending Tests</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        {diagnosticsData?.overview.pendingTests || 0}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Tests awaiting completion.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          {diagnosticsData?.overview.testsCompleted ? 
                            Math.round((diagnosticsData.overview.pendingTests / (diagnosticsData.overview.testsCompleted + diagnosticsData.overview.pendingTests)) * 100) : 0
                          }% of total tests
                        </span>
                        <div className="flex items-center text-sm text-orange-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          In progress
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ 
                            width: `${diagnosticsData?.overview.testsCompleted ? 
                              Math.min((diagnosticsData.overview.pendingTests / (diagnosticsData.overview.testsCompleted + diagnosticsData.overview.pendingTests)) * 100, 100) : 0
                            }%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{diagnosticsData?.overview.pendingTests || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>PENDING</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{diagnosticsData?.metrics.totalAppointments || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>TOTAL APPOINTMENTS</div>
                      </div>
                    </div>
                  </div>

                  {/* Average Test Time */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Average Test Time</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        {diagnosticsData?.overview.avgTestTime || 0} min
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Average time per diagnostic test.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>Target: 60 minutes</span>
                        <div className="flex items-center text-sm text-blue-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          {diagnosticsData?.overview.avgTestTime ? 
                            `${diagnosticsData.overview.avgTestTime > 60 ? '+' : ''}${diagnosticsData.overview.avgTestTime - 60} min vs target` : 
                            'No data'
                          }
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.min((diagnosticsData?.overview.avgTestTime || 0) / 60 * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{diagnosticsData?.overview.avgTestTime || 0} min</div>
                        <div className="text-xs" style={{ color: '#717182' }}>CURRENT</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">60 min</div>
                        <div className="text-xs" style={{ color: '#717182' }}>TARGET</div>
                      </div>
                    </div>
                  </div>

                  {/* Total Revenue */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Total Revenue</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        ₹{diagnosticsData?.overview.totalRevenue?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Revenue generated from diagnostic tests.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          ₹{diagnosticsData?.metrics.avgRevenuePerTest?.toLocaleString() || 0} avg per test
                        </span>
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {diagnosticsData?.overview.revenueChange ? 
                            `${diagnosticsData.overview.revenueChange > 0 ? '+' : ''}${diagnosticsData.overview.revenueChange}% vs last period` : 
                            'No comparison data'
                          }
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '87.5%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">₹{Math.round((diagnosticsData?.overview.totalRevenue || 0) * 0.9).toLocaleString()}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>COLLECTED</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">₹{Math.round((diagnosticsData?.overview.totalRevenue || 0) * 0.1).toLocaleString()}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>PENDING</div>
                      </div>
                    </div>
                  </div>
             </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Test Types Distribution */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Test Types Distribution</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Distribution of diagnostic tests performed</p>
                    {diagnosticsData?.charts.testTypesDistribution && diagnosticsData.charts.testTypesDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={diagnosticsData.charts.testTypesDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p>No test types data available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hearing Loss Distribution */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Hearing Loss Distribution</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Patient hearing assessment results</p>
                    {diagnosticsData?.charts.hearingLossDistribution && diagnosticsData.charts.hearingLossDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={diagnosticsData.charts.hearingLossDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="count"
                          >
                            {diagnosticsData.charts.hearingLossDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                          </svg>
                          <p>No hearing loss distribution data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {(!isSuperAdmin || !isSuperAdminView) && activeTab === 'hearing-aid' && (
          <div className="space-y-6">
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading hearing aid data...</span>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading hearing aid data</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && hearingAidData && (
              <>
                {/* Key Metrics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Hearing Aids Sold */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Hearing Aids Sold</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        {hearingAidData.overview?.totalSold || 0}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Total hearing aids sold this month.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>↑ 18% vs last month</span>
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          Trending up
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87.3%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {hearingAidData.overview?.onTimeDelivery || 0}
                        </div>
                        <div className="text-xs" style={{ color: '#717182' }}>ON TIME DELIVERY</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">
                          {hearingAidData.overview?.lateDelivery || 0}
                        </div>
                        <div className="text-xs" style={{ color: '#717182' }}>LATE DELIVERY</div>
                      </div>
                    </div>
                  </div>

                  {/* Sales Revenue */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Sales Revenue</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        ₹{hearingAidData.overview?.totalRevenue?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Total revenue from hearing aid sales.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>↑ 22% vs last month</span>
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          Strong growth
                        </div>
                      </div>
                      <div className="w-full bg-orange-500 h-2 rounded-full" style={{ width: '87.5%' }}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          ₹{hearingAidData.overview?.collectedAmount?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs" style={{ color: '#717182' }}>COLLECTED</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          ₹{hearingAidData.overview?.pendingAmount?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs" style={{ color: '#717182' }}>PENDING</div>
                      </div>
                    </div>
                  </div>

                  {/* Average ASP */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Average ASP</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        ₹{hearingAidData.overview?.averageSellingPrice?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Average selling price per hearing aid.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>↑ 3% vs last month</span>
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          Price increase
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">₹12,650</div>
                        <div className="text-xs" style={{ color: '#717182' }}>LAST MONTH</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">₹396</div>
                        <div className="text-xs" style={{ color: '#717182' }}>INCREASE</div>
                      </div>
                    </div>
                  </div>

                  {/* Binaural Ratio */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Binaural Ratio</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        {hearingAidData.overview?.binauralRatio || 0}%
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Percentage of binaural fittings.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>97 binaural vs 45 monaural</span>
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          Target: 70%
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${hearingAidData.overview?.binauralRatio || 0}%` }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">97</div>
                        <div className="text-xs" style={{ color: '#717182' }}>BINAURAL</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">45</div>
                        <div className="text-xs" style={{ color: '#717182' }}>MONAURAL</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Hearing Aid Sales Trends */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Hearing Aid Sales Trends</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Monthly sales performance</p>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={hearingAidData.charts?.salesTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="units" stroke="#3B82F6" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Hearing Aid Distribution */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Hearing Aid Distribution</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Breakdown of hearing aid types</p>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={hearingAidData.charts?.distributionByType || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(hearingAidData.charts?.distributionByType || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Binaural vs Monaural Distribution */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Binaural vs Monaural Distribution</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Breakdown of binaural vs monaural hearing aids</p>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={hearingAidData.charts?.binauralDistribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(hearingAidData.charts?.binauralDistribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Middle Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Binaural Models Distribution */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Binaural Models Distribution</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Breakdown of binaural hearing aid models</p>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={hearingAidData.charts?.binauralModels || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="units"
                        >
                          {(hearingAidData.charts?.binauralModels || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${index * 50}, 70%, 50%)`} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Monaural Models Distribution */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Monaural Models Distribution</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Breakdown of monaural hearing aid models</p>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={hearingAidData.charts?.monauralModels || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="units"
                        >
                          {(hearingAidData.charts?.monauralModels || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${index * 50}, 70%, 50%)`} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Hearing Aid Response Time */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Hearing Aid Response Time</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>Average time to deliver hearing aids</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#101828' }}>Same Day</div>
                      <div className="text-xs" style={{ color: '#717182' }}>Within 24 hours</div>
                    </div>
                    <div className="text-lg font-bold text-green-600">65%</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#101828' }}>1-2 Days</div>
                      <div className="text-xs" style={{ color: '#717182' }}>Within 48 hours</div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">25%</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#101828' }}>3+ Days</div>
                      <div className="text-xs" style={{ color: '#717182' }}>More than 72 hours</div>
                    </div>
                    <div className="text-lg font-bold text-orange-600">10%</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-800">Average Response Time: 1.2 days</div>
                  <div className="text-xs text-green-600">Target: 1 day</div>
                </div>
              </div>

              {/* Hearing Aid Quality Score */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Hearing Aid Quality Score</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>Quality assessment of hearing aids</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#717182' }}>Excellent (Complete info)</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                      <span className="text-sm font-medium">70%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#717182' }}>Good (Partial info)</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#717182' }}>Poor (Incomplete info)</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">Overall Quality Score: 8.2/10</div>
                  <div className="text-xs text-blue-600">Target: 8.5/10</div>
                </div>
              </div>

              {/* Hearing Aid Partner Network */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Partner Network Growth</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>New referral partners added</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#101828' }}>This Month</div>
                      <div className="text-xs" style={{ color: '#717182' }}>New partners added</div>
                    </div>
                    <div className="text-lg font-bold text-green-600">+2</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#101828' }}>Total Partners</div>
                      <div className="text-xs" style={{ color: '#717182' }}>Active referral network</div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">18</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#101828' }}>Engagement Rate</div>
                      <div className="text-xs" style={{ color: '#717182' }}>Partners with referrals</div>
                    </div>
                    <div className="text-lg font-bold text-purple-600">83%</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-800">Network Growth: +12.5%</div>
                  <div className="text-xs text-purple-600">Target: +10% monthly</div>
                </div>
              </div>
                </div>
              </>
            )}
          </div>
        )}

        {(!isSuperAdmin || !isSuperAdminView) && activeTab === 'billings' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading billings data...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-red-600 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button 
                    onClick={fetchBillingsData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : !billingsData ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">No billings data available for the selected period.</p>
                  <button 
                    onClick={fetchBillingsData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Top Row - Key Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Total Revenue */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Total Revenue</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        ₹{billingsData?.overview.totalRevenue?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Total revenue generated in selected period.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          ₹{billingsData?.overview.dailyAverage?.toLocaleString() || 0} daily average
                        </span>
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {billingsData?.overview.revenueChange ? 
                            `${billingsData.overview.revenueChange > 0 ? '+' : ''}${billingsData.overview.revenueChange}% vs last period` : 
                            'No comparison data'
                          }
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">₹{billingsData?.collection.collectedAmount?.toLocaleString() || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>COLLECTED</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">₹{billingsData?.collection.outstandingAmount?.toLocaleString() || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>OUTSTANDING</div>
                      </div>
                    </div>
                  </div>

                  {/* Collection Rate */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Collection Rate</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        {billingsData?.collection.collectionRate || 0}%
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Percentage of revenue collected.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          {billingsData?.collection.avgDaysToCollect || 0} days avg to collect
                        </span>
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {billingsData?.collection.collectionChange ? 
                            `${billingsData.collection.collectionChange > 0 ? '+' : ''}${billingsData.collection.collectionChange}% vs last period` : 
                            'No comparison data'
                          }
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(billingsData?.collection.collectionRate || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{billingsData?.collection.sameDayRate || 0}%</div>
                        <div className="text-xs" style={{ color: '#717182' }}>SAME DAY</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">₹{billingsData?.collection.advancePayments?.toLocaleString() || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>ADVANCE</div>
                      </div>
                    </div>
                  </div>

                  {/* Total Invoices */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Total Invoices</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        {billingsData?.transactions.totalInvoices || 0}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Total invoices generated in selected period.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          ₹{billingsData?.transactions.avgInvoice?.toLocaleString() || 0} average per invoice
                        </span>
                        <div className="flex items-center text-sm text-blue-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          {billingsData?.metrics.totalTransactions || 0} transactions
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">₹{billingsData?.transactions.gstCollected?.toLocaleString() || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>GST COLLECTED</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">₹{billingsData?.transactions.totalDiscount?.toLocaleString() || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>TOTAL DISCOUNT</div>
                      </div>
                    </div>
                  </div>

                  {/* Commission Paid */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Commission Paid</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        ₹{billingsData?.transactions.commissionPaid?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>To referring doctors.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          {billingsData?.overview.totalRevenue ? 
                            Math.round((billingsData.transactions.commissionPaid / billingsData.overview.totalRevenue) * 100) : 0
                          }% of total revenue
                        </span>
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          Paid
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">₹{billingsData?.transactions.commissionPaid?.toLocaleString() || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>PAID</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{billingsData?.overview.uniquePatients || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>UNIQUE PATIENTS</div>
                      </div>
                    </div>
                  </div>
             </div>

                {/* Middle Row - Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payment Method Distribution */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Payment Method Distribution</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Customer payment preferences analysis</p>
                    
                    {billingsData?.charts.paymentMethods && billingsData.charts.paymentMethods.length > 0 ? (
                      <>
                        {/* Summary Box */}
                        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-sm font-medium" style={{ color: '#101828' }}>Cash</div>
                            <div className="text-xs" style={{ color: '#717182' }}>Most Popular</div>
                            <div className="text-lg font-bold text-blue-600">
                              {billingsData.charts.paymentMethods.find(m => m.method === 'Cash')?.percentage || 0}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium" style={{ color: '#101828' }}>Digital Payments</div>
                            <div className="text-xs" style={{ color: '#717182' }}>Card + UPI + Transfer</div>
                            <div className="text-lg font-bold text-green-600">
                              {billingsData.charts.paymentMethods
                                .filter(m => ['Card', 'UPI', 'Bank Transfer'].includes(m.method))
                                .reduce((sum, m) => sum + m.percentage, 0)}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium" style={{ color: '#101828' }}>Average Transaction</div>
                            <div className="text-xs" style={{ color: '#717182' }}>Per payment</div>
                            <div className="text-lg font-bold text-purple-600">
                              ₹{billingsData?.metrics.avgTransactionAmount?.toLocaleString() || 0}
                            </div>
                          </div>
                        </div>

                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={billingsData.charts.paymentMethods}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="percentage"
                            >
                              {billingsData.charts.paymentMethods.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>

                        {/* Payment Details */}
                        <div className="mt-4 space-y-2">
                          {billingsData.charts.paymentMethods.map((method, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span style={{ color: '#717182' }}>{method.method}:</span>
                              <span className="font-medium" style={{ color: '#101828' }}>
                                ₹{method.amount.toLocaleString()} ({method.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-800">
                            Digital payments represent {billingsData.charts.paymentMethods
                              .filter(m => ['Card', 'UPI', 'Bank Transfer'].includes(m.method))
                              .reduce((sum, m) => sum + m.percentage, 0)}% of transactions, showing growing adoption
                          </div>
                          <div className="text-xs text-blue-600">{billingsData?.metrics.totalTransactions || 0} Total transactions</div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-gray-500">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <p>No payment method data available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Service Breakdown */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Service Breakdown</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Revenue breakdown by service categories</p>
                    
                    {billingsData?.charts.serviceBreakdown && billingsData.charts.serviceBreakdown.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={billingsData.charts.serviceBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="service" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="amount" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer>

                        {/* Detailed Breakdown */}
                        <div className="mt-4 space-y-2">
                          {billingsData.charts.serviceBreakdown.map((service, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span style={{ color: '#717182' }}>{service.service}:</span>
                              <span className="font-medium" style={{ color: '#101828' }}>
                                ₹{service.amount.toLocaleString()} ({service.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-gray-500">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p>No service breakdown data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row - Additional Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Age Distribution */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Customer Age Distribution</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Patient demographics by age groups</p>
                    
                    {billingsData?.charts.ageDistribution && billingsData.charts.ageDistribution.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={billingsData.charts.ageDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="percentage"
                            >
                              {billingsData.charts.ageDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>

                        {/* Age Group Details */}
                        <div className="mt-4 space-y-2">
                          {billingsData.charts.ageDistribution.map((age, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span style={{ color: '#717182' }}>{age.ageGroup}:</span>
                              <span className="font-medium" style={{ color: '#101828' }}>
                                {age.count} patients ({age.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                          <div className="text-sm font-medium text-purple-800">
                            {billingsData?.metrics.seniorPatientPercentage || 0}% of patients are 61+ years old
                          </div>
                          <div className="text-xs text-purple-600">{billingsData?.overview.uniquePatients || 0} Total patients</div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-gray-500">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          <p>No age distribution data available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Collection Timeline Performance */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Collection Timeline Performance</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Payment collection efficiency metrics</p>
                    
                    {billingsData?.charts.collectionTimeline ? (
                      <>
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="text-sm font-medium text-purple-800">Average Days to collect payment</div>
                            <div className="text-2xl font-bold text-purple-600">{billingsData.charts.collectionTimeline.avgDaysToCollect} days</div>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-sm font-medium text-green-800">Same Day payment rate</div>
                            <div className="text-2xl font-bold text-green-600">{billingsData.charts.collectionTimeline.sameDay}%</div>
                          </div>
                        </div>

                        {/* Collection Progress Bars */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium" style={{ color: '#101828' }}>Same Day</span>
                              <span className="text-sm font-bold text-green-600">{billingsData.charts.collectionTimeline.sameDay}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="h-3 rounded-full bg-green-500" 
                                style={{ width: `${billingsData.charts.collectionTimeline.sameDay}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium" style={{ color: '#101828' }}>Within 7 Days</span>
                              <span className="text-sm font-bold text-blue-600">{billingsData.charts.collectionTimeline.within7Days}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="h-3 rounded-full bg-blue-500" 
                                style={{ width: `${billingsData.charts.collectionTimeline.within7Days}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium" style={{ color: '#101828' }}>Within 30 Days</span>
                              <span className="text-sm font-bold text-purple-600">{billingsData.charts.collectionTimeline.within30Days}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="h-3 rounded-full bg-purple-500" 
                                style={{ width: `${billingsData.charts.collectionTimeline.within30Days}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-gray-500">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p>No collection timeline data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {(!isSuperAdmin || !isSuperAdminView) && activeTab === 'inventory' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading inventory data...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-red-600 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button 
                    onClick={fetchInventoryData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : !inventoryData ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">No inventory data available for the selected period.</p>
                  <button 
                    onClick={fetchInventoryData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Top Row - Key Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Total Inventory Value */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Total Inventory Value</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>
                        ₹{inventoryData?.overview.totalInventoryValue?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Total value of current inventory.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          ₹{inventoryData?.metrics.averageStockValue?.toLocaleString() || 0} avg per item
                        </span>
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {inventoryData?.metrics.inventoryTurnover || 0}x turnover
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{inventoryData?.overview.activeItems || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>ACTIVE ITEMS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{inventoryData?.overview.totalSkus || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>TOTAL SKUS</div>
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Items */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Low Stock Items</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#F59E0B' }}>
                        {inventoryData?.overview.lowStockItems || 0}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Items below reorder level.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          {inventoryData?.metrics.reorderAlerts || 0} reorder alerts
                        </span>
                        <div className="flex items-center text-sm text-orange-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Action required
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ 
                            width: `${inventoryData?.overview.totalSkus ? 
                              Math.min((inventoryData.overview.lowStockItems / inventoryData.overview.totalSkus) * 100, 100) : 0
                            }%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{inventoryData?.overview.lowStockItems || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>LOW STOCK</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{inventoryData?.overview.activeItems || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>ACTIVE ITEMS</div>
                      </div>
                    </div>
                  </div>

                  {/* Out of Stock */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Out of Stock</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#EF4444' }}>
                        {inventoryData?.overview.outOfStockItems || 0}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Items completely out of stock.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          {inventoryData?.metrics.criticalItems || 0} critical items
                        </span>
                        <div className="flex items-center text-sm text-red-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {inventoryData?.overview.outOfStockItems ? 'Critical shortage' : 'All items in stock'}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ 
                            width: `${inventoryData?.overview.totalSkus ? 
                              Math.min((inventoryData.overview.outOfStockItems / inventoryData.overview.totalSkus) * 100, 100) : 0
                            }%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{inventoryData?.overview.outOfStockItems || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>OUT OF STOCK</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{inventoryData?.overview.activeItems || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>IN STOCK</div>
                      </div>
                    </div>
                  </div>

                  {/* Expiring Soon */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Expiring Soon</h3>
                      <span className="text-sm" style={{ color: '#717182' }}>{timeFilter}</span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2" style={{ color: '#F59E0B' }}>
                        {inventoryData?.overview.expiringSoonItems || 0}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#717182' }}>Items expiring within 30 days.</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: '#101828' }}>
                          {inventoryData?.metrics.criticalItems || 0} critical items
                        </span>
                        <div className="flex items-center text-sm text-orange-600">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {inventoryData?.overview.expiringSoonItems ? 'Action required' : 'All items valid'}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ 
                            width: `${inventoryData?.overview.totalSkus ? 
                              Math.min((inventoryData.overview.expiringSoonItems / inventoryData.overview.totalSkus) * 100, 100) : 0
                            }%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{inventoryData?.overview.expiringSoonItems || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>EXPIRING</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{inventoryData?.overview.activeItems || 0}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>VALID</div>
                      </div>
                    </div>
                  </div>
             </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Current Stock Status */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Current Stock Status</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Quick inventory health overview</p>
                    
                    {inventoryData?.charts.stockStatus && inventoryData.charts.stockStatus.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={inventoryData.charts.stockStatus}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={120}
                              paddingAngle={5}
                              dataKey="count"
                            >
                              {inventoryData.charts.stockStatus.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 4]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>

                        {/* Stock Status Details */}
                        <div className="mt-4 space-y-2">
                          {inventoryData.charts.stockStatus.map((status, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span style={{ color: '#717182' }}>{status.status}:</span>
                              <span className="font-medium" style={{ color: '#101828' }}>
                                {status.count} items ({status.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <p>No stock status data available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Best Selling Brands */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Best Selling Brands</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Top performing brands by sales volume</p>
                    
                    {inventoryData?.charts.bestSellingBrands && inventoryData.charts.bestSellingBrands.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={inventoryData.charts.bestSellingBrands}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="brand" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="quantity" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer>

                        {/* Brand Details */}
                        <div className="mt-4 space-y-2">
                          {inventoryData.charts.bestSellingBrands.map((brand, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span style={{ color: '#717182' }}>{brand.brand}:</span>
                              <span className="font-medium" style={{ color: '#101828' }}>
                                {brand.quantity} units sold
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p>No brand sales data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row - Additional Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Summary */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Category Summary</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Inventory breakdown by category</p>
                    
                    {inventoryData?.categorySummary && inventoryData.categorySummary.length > 0 ? (
                      <>
                        <div className="space-y-4">
                          {inventoryData.categorySummary.map((category, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium capitalize" style={{ color: '#101828' }}>
                                  {category.category}
                                </span>
                                <span className="text-sm font-bold text-blue-600">
                                  ₹{category.totalValue.toLocaleString()}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-bold text-green-600">{category.totalItems}</div>
                                  <div style={{ color: '#717182' }}>Total</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-bold text-orange-600">{category.lowStockItems}</div>
                                  <div style={{ color: '#717182' }}>Low Stock</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-bold text-red-600">{category.outOfStockItems}</div>
                                  <div style={{ color: '#717182' }}>Out of Stock</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <p>No category data available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Branch Summary */}
                  <div className="bg-white rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Branch Summary</h3>
                    <p className="text-sm mb-4" style={{ color: '#717182' }}>Inventory distribution across branches</p>
                    
                    {inventoryData?.branchSummary && inventoryData.branchSummary.length > 0 ? (
                      <>
                        <div className="space-y-4">
                          {inventoryData.branchSummary.map((branch, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium" style={{ color: '#101828' }}>
                                  {branch.branchName}
                                </span>
                                <span className="text-sm font-bold text-green-600">
                                  ₹{branch.totalValue.toLocaleString()}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <div className="font-bold text-blue-600">{branch.totalItems}</div>
                                  <div style={{ color: '#717182' }}>Total Items</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-bold text-orange-600">{branch.lowStockItems}</div>
                                  <div style={{ color: '#717182' }}>Low Stock</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-bold text-red-600">{branch.outOfStockItems}</div>
                                  <div style={{ color: '#717182' }}>Out of Stock</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <p>No branch data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

         {/* Placeholder for other tabs */}
         {(!isSuperAdmin || !isSuperAdminView) && activeTab !== 'appointments' && activeTab !== 'doctor-referral' && activeTab !== 'diagnostics' && activeTab !== 'hearing-aid' && activeTab !== 'billings' && activeTab !== 'inventory' && (
          <div className="bg-white rounded-lg border border-border p-12 text-center">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>
              {tabs.find(tab => tab.id === activeTab)?.label} Dashboard
            </h3>
            <p className="text-sm" style={{ color: '#717182' }}>
              This section is under development. Coming soon!
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
