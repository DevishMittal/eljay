'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';
import { DashboardService, DashboardAppointmentsData } from '@/services/dashboardService';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [timeFilter, setTimeFilter] = useState('Last 30 Days');
  const [appointmentsData, setAppointmentsData] = useState<DashboardAppointmentsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const data = await DashboardService.getAppointmentsData(startDate, endDate);
      setAppointmentsData(data);
    } catch (error) {
      console.error('Error fetching appointments data:', error);
      setError('Failed to fetch appointments data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when tab changes or time filter changes
  useEffect(() => {
    fetchAppointmentsData();
  }, [activeTab, timeFilter]);

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

  // Mock data for other sections (to be replaced when APIs are ready)
  const appointmentStatusData = [
    { name: 'Completed', value: 149, color: '#10B981' },
    { name: 'Pending', value: 12, color: '#F59E0B' },
    { name: 'Cancelled', value: 6, color: '#EF4444' }
  ];

  const appointmentTrendsData = [
    { month: 'Jul', total: 180, completed: 160, cancelled: 20 },
    { month: 'Aug', total: 190, completed: 170, cancelled: 20 },
    { month: 'Sep', total: 210, completed: 185, cancelled: 25 },
    { month: 'Oct', total: 200, completed: 175, cancelled: 25 },
    { month: 'Nov', total: 195, completed: 175, cancelled: 20 },
    { month: 'Dec', total: 167, completed: 149, cancelled: 18 }
  ];

  const audiologistPerformanceData = [
    { name: 'Dr. Sarah Johnson', appointments: 70 },
    { name: 'Dr. Michael Brown', appointments: 60 },
    { name: 'Dr. Jennifer Lee', appointments: 55 },
    { name: 'Dr. David Chen', appointments: 50 },
    { name: 'Dr. Emily Davis', appointments: 48 }
  ];

  const channelDistributionData = [
    { name: 'Direct', value: 45, color: '#3B82F6' },
    { name: 'Referral', value: 35, color: '#10B981' },
    { name: 'Online', value: 20, color: '#F59E0B' }
  ];

  const attendanceRateData = [
    { month: 'Jul', rate: 82, target: 85 },
    { month: 'Aug', rate: 84, target: 85 },
    { month: 'Sep', rate: 83, target: 85 },
    { month: 'Oct', rate: 82, target: 85 },
    { month: 'Nov', rate: 87, target: 85 },
    { month: 'Dec', rate: 89, target: 85 }
  ];

  const bookingLeadTimeData = [
    { range: '0-1', count: 28 },
    { range: '2-3', count: 33 },
    { range: '4-7', count: 42 },
    { range: '8-14', count: 22 },
    { range: '15+', count: 14 }
  ];

  // Doctor Referral Data
  const referralSourceData = [
    { name: 'ENT Specialists', value: 45, color: '#3B82F6' },
    { name: 'General Physicians', value: 30, color: '#10B981' },
    { name: 'Pediatricians', value: 15, color: '#F59E0B' },
    { name: 'Neurologists', value: 10, color: '#EF4444' }
  ];

  const referralTrendsData = [
    { month: 'Jul', referrals: 28, conversions: 22, revenue: 45000 },
    { month: 'Aug', referrals: 32, conversions: 26, revenue: 52000 },
    { month: 'Sep', referrals: 35, conversions: 29, revenue: 58000 },
    { month: 'Oct', referrals: 30, conversions: 25, revenue: 50000 },
    { month: 'Nov', referrals: 38, conversions: 32, revenue: 64000 },
    { month: 'Dec', referrals: 42, conversions: 35, revenue: 70000 }
  ];

  const topReferringDoctorsData = [
    { name: 'Dr. Rajesh Kumar', referrals: 15, conversions: 12, revenue: 24000 },
    { name: 'Dr. Priya Sharma', referrals: 12, conversions: 10, revenue: 20000 },
    { name: 'Dr. Amit Patel', referrals: 10, conversions: 8, revenue: 16000 },
    { name: 'Dr. Sneha Reddy', referrals: 8, conversions: 7, revenue: 14000 },
    { name: 'Dr. Karthik Rao', referrals: 6, conversions: 5, revenue: 10000 }
  ];

  const referralConversionData = [
    { status: 'Referred', count: 42, color: '#3B82F6' },
    { status: 'Scheduled', count: 35, color: '#10B981' },
    { status: 'Completed', count: 32, color: '#22C55E' },
    { status: 'No Show', count: 3, color: '#F59E0B' },
    { status: 'Cancelled', count: 7, color: '#EF4444' }
  ];

  const referralRevenueData = [
    { month: 'Jul', revenue: 45000, target: 40000 },
    { month: 'Aug', revenue: 52000, target: 40000 },
    { month: 'Sep', revenue: 58000, target: 40000 },
    { month: 'Oct', revenue: 50000, target: 40000 },
    { month: 'Nov', revenue: 64000, target: 40000 },
    { month: 'Dec', revenue: 70000, target: 40000 }
  ];

  // Diagnostics Data
  const testTypesData = [
    { name: 'PTA/IMP', tests: 140, color: '#3B82F6' },
    { name: 'OAE/BERA', tests: 100, color: '#10B981' },
    { name: 'Balance Assessment', tests: 70, color: '#F59E0B' }
  ];

  const hearingLossDistributionData = [
    { name: 'Normal', value: 45, color: '#10B981' },
    { name: 'Mild', value: 25, color: '#F59E0B' },
    { name: 'Moderate', value: 20, color: '#EF4444' },
    { name: 'Severe', value: 10, color: '#DC2626' }
  ];

  const diagnosticsTrendsData = [
    { month: 'Jul', tests: 280, revenue: 320000, avgTime: 68 },
    { month: 'Aug', tests: 295, revenue: 340000, avgTime: 66 },
    { month: 'Sep', tests: 310, revenue: 360000, avgTime: 65 },
    { month: 'Oct', tests: 290, revenue: 335000, avgTime: 67 },
    { month: 'Nov', tests: 305, revenue: 355000, avgTime: 64 },
    { month: 'Dec', tests: 314, revenue: 370000, avgTime: 65 }
  ];

  const diagnosticsPerformanceData = [
    { name: 'Dr. Sarah Johnson', tests: 85, accuracy: 98, avgTime: 62 },
    { name: 'Dr. Michael Brown', tests: 72, accuracy: 96, avgTime: 68 },
    { name: 'Dr. Jennifer Lee', tests: 68, accuracy: 97, avgTime: 65 },
    { name: 'Dr. David Chen', tests: 55, accuracy: 95, avgTime: 70 },
    { name: 'Dr. Emily Davis', tests: 34, accuracy: 99, avgTime: 60 }
  ];

  const testAccuracyData = [
    { category: 'PTA/IMP', accuracy: 98, target: 95 },
    { category: 'OAE/BERA', accuracy: 96, target: 95 },
    { category: 'Balance Assessment', accuracy: 94, target: 95 }
  ];

  // Hearing Aid Data
  const revenueDistributionData = [
    { name: 'Direct Sales', value: 45, color: '#3B82F6' },
    { name: 'Referral Sales', value: 35, color: '#10B981' },
    { name: 'Online Sales', value: 20, color: '#F59E0B' }
  ];

  const monthlySalesTrendData = [
    { month: 'Jan', units: 100 },
    { month: 'Feb', units: 115 },
    { month: 'Mar', units: 125 },
    { month: 'Apr', units: 140 },
    { month: 'May', units: 130 },
    { month: 'Jun', units: 142 }
  ];

  const clinicPerformanceData = [
    { name: 'Bangalore Central', sales: 4.5 },
    { name: 'Mumbai Andheri', sales: 3.5 },
    { name: 'Delhi CP', sales: 2.5 },
    { name: 'Chennai T.Nagar', sales: 2.0 },
    { name: 'Pune FC Road', sales: 1.0 }
  ];

  const hearingAidAudiologistData = [
    { name: 'Dr. Sneha Reddy', units: 30 },
    { name: 'Dr. Rahul Mehta', units: 28 },
    { name: 'Dr. Kavita Singh', units: 26 },
    { name: 'Dr. Arjun Nair', units: 20 },
    { name: 'Dr. Meera Gupta', units: 23 }
  ];

  const hatDistributionData = [
    { name: 'HAT (Technology)', value: 42.5, units: 64, revenue: 2.5, color: '#3B82F6' },
    { name: 'HAA (Accessories)', value: 36.5, units: 56, revenue: 1.7, color: '#10B981' },
    { name: 'HAF (Fitting)', value: 21, units: 22, revenue: 0.9, color: '#F59E0B' }
  ];

  const binauralDistributionData = [
    { name: 'Binaural', value: 68, units: 97, color: '#3B82F6' },
    { name: 'Monaural', value: 32, units: 45, color: '#F59E0B' }
  ];

  const binauralModelsData = [
    { name: 'Phonak Audéo Paradise', units: 34 },
    { name: 'Oticon More 1', units: 28 },
    { name: 'Widex EVOKE 440', units: 22 },
    { name: 'Signia Pure Charge&Go X', units: 13 }
  ];

  const monauralModelsData = [
    { name: 'Phonak Audéo Liffe', units: 18 },
    { name: 'Oticon Ruby 2', units: 12 },
    { name: 'Widex MOMENT 220', units: 9 },
    { name: 'Signia Pure 312 3X', units: 6 }
  ];

  const tabs = [
    { id: 'appointments', label: 'Appointments' },
    { id: 'doctor-referral', label: 'Doctor Referral' },
    { id: 'diagnostics', label: 'Diagnostics' },
    { id: 'hearing-aid', label: 'Hearing Aid' },
    { id: 'billings', label: 'Billings' },
    { id: 'inventory', label: 'Inventory' }
  ];

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
            <h1 className="text-2xl font-bold" style={{ color: '#101828' }}>Dashboard</h1>
                         <p className="text-sm mt-1" style={{ color: '#717182' }}>
               Welcome back! Here&apos;s what&apos;s happening at your clinic.
             </p>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 border border-border rounded-lg bg-white relative">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
                         <select 
               value={timeFilter} 
               onChange={(e) => setTimeFilter(e.target.value)}
               className="text-sm border-none outline-none bg-transparent appearance-none pr-6"
               style={{ color: '#101828' }}
               aria-label="Select time period"
             >
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
            <svg className="w-4 h-4 absolute right-2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
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

        {/* Dashboard Content */}
        {activeTab === 'appointments' && (
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
                {chartData?.appointmentStatusData && chartData.appointmentStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.appointmentStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.appointmentStatusData.map((entry, index) => (
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
                {chartData?.appointmentTrendsData && chartData.appointmentTrendsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.appointmentTrendsData}>
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
                  <BarChart data={chartData?.audiologistPerformanceData || []}>
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
                      data={chartData?.channelDistributionData || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(chartData?.channelDistributionData || []).map((entry, index) => (
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
                  <BarChart data={chartData?.bookingLeadTimeData || []}>
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
                <LineChart data={chartData?.attendanceRateData || []}>
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

        {activeTab === 'doctor-referral' && (
          <div className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Total Referrals */}
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Total Referrals</h3>
                  <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>42</div>
                  <div className="text-sm mb-2" style={{ color: '#717182' }}>Total referrals received this month.</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: '#101828' }}>83.3% conversion rate</span>
                    <div className="flex items-center text-sm text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      12.5% vs last month
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '83.3%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">35</div>
                    <div className="text-xs" style={{ color: '#717182' }}>CONVERTED</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">7</div>
                    <div className="text-xs" style={{ color: '#717182' }}>PENDING</div>
                  </div>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Conversion Rate</h3>
                  <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>83.3%</div>
                  <div className="text-sm mb-2" style={{ color: '#717182' }}>Referrals converted to appointments.</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: '#101828' }}>35 out of 42 referrals</span>
                    <div className="flex items-center text-sm text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +5.2% vs last month
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '83.3%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">32</div>
                    <div className="text-xs" style={{ color: '#717182' }}>COMPLETED</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">3</div>
                    <div className="text-xs" style={{ color: '#717182' }}>NO SHOW</div>
                  </div>
                </div>
              </div>

              {/* Revenue Generated */}
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Revenue Generated</h3>
                  <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>₹70,000</div>
                  <div className="text-sm mb-2" style={{ color: '#717182' }}>Revenue from referral patients.</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: '#101828' }}>₹2,000 avg per patient</span>
                    <div className="flex items-center text-sm text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      16.7% vs last month
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '87.5%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">₹64,000</div>
                    <div className="text-xs" style={{ color: '#717182' }}>COLLECTED</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">₹6,000</div>
                    <div className="text-xs" style={{ color: '#717182' }}>PENDING</div>
                  </div>
                </div>
              </div>

              {/* Active Referral Partners */}
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Active Partners</h3>
                  <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>18</div>
                  <div className="text-sm mb-2" style={{ color: '#717182' }}>Active referring doctors.</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: '#101828' }}>2.3 avg referrals per doctor</span>
                    <div className="flex items-center text-sm text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +2 new partners
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">15</div>
                    <div className="text-xs" style={{ color: '#717182' }}>ENT SPECIALISTS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">3</div>
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
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={referralSourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {referralSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Referral Trends */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Referral Trends</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>Monthly performance tracking</p>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={referralTrendsData}>
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
              </div>

              {/* Top Referring Doctors */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Top Referring Doctors</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>This month&apos;s top performers</p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topReferringDoctorsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="referrals" fill="#3B82F6" />
                    <Bar dataKey="conversions" fill="#10B981" />
                    <Bar dataKey="revenue" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Referral Conversion Status */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Referral Conversion Status</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>Current month breakdown</p>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={referralConversionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {referralConversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Referral Revenue */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Referral Revenue</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>Monthly revenue from referrals</p>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={referralRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#F59E0B" name="Revenue" />
                    <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Referral Response Time */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Referral Response Time</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>Average time to respond to referrals</p>
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

              {/* Referral Quality Score */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Referral Quality Score</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>Quality assessment of referrals</p>
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

              {/* Referral Partner Network */}
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
          </div>
        )}

                 {activeTab === 'diagnostics' && (
           <div className="space-y-6">
             {/* Key Metrics Row */}
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
               {/* Tests Completed */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Tests Completed</h3>
                   <span className="text-sm" style={{ color: '#717182' }}>This month</span>
                 </div>
                 <div className="mb-4">
                   <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>314</div>
                   <div className="text-sm mb-2" style={{ color: '#717182' }}>Total tests completed this month.</div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium" style={{ color: '#101828' }}>93.2% completion rate</span>
                     <div className="flex items-center text-sm text-green-600">
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                       </svg>
                       +5.2% vs last month
                     </div>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div className="bg-green-500 h-2 rounded-full" style={{ width: '93.2%' }}></div>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="text-center">
                     <div className="text-lg font-bold text-green-600">314</div>
                     <div className="text-xs" style={{ color: '#717182' }}>COMPLETED</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-orange-600">23</div>
                     <div className="text-xs" style={{ color: '#717182' }}>PENDING</div>
                   </div>
                 </div>
               </div>

               {/* Pending Tests */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Pending Tests</h3>
                   <span className="text-sm" style={{ color: '#717182' }}>Awaiting completion</span>
                 </div>
                 <div className="mb-4">
                   <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>23</div>
                   <div className="text-sm mb-2" style={{ color: '#717182' }}>Tests awaiting completion.</div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium" style={{ color: '#101828' }}>6.8% of total tests</span>
                     <div className="flex items-center text-sm text-orange-600">
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       In progress
                     </div>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div className="bg-orange-500 h-2 rounded-full" style={{ width: '6.8%' }}></div>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="text-center">
                     <div className="text-lg font-bold text-orange-600">15</div>
                     <div className="text-xs" style={{ color: '#717182' }}>SCHEDULED</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-red-600">8</div>
                     <div className="text-xs" style={{ color: '#717182' }}>OVERDUE</div>
                   </div>
                 </div>
               </div>

               {/* Average Test Time */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Average Test Time</h3>
                   <span className="text-sm" style={{ color: '#717182' }}>Weighted average</span>
                 </div>
                 <div className="mb-4">
                   <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>65 min</div>
                   <div className="text-sm mb-2" style={{ color: '#717182' }}>Average time per diagnostic test.</div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium" style={{ color: '#101828' }}>Target: 60 minutes</span>
                     <div className="flex items-center text-sm text-blue-600">
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                       </svg>
                       +5 min vs target
                     </div>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="text-center">
                     <div className="text-lg font-bold text-blue-600">65 min</div>
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
                   <span className="text-sm" style={{ color: '#717182' }}>From diagnostics</span>
                 </div>
                 <div className="mb-4">
                   <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>₹3,70,000</div>
                   <div className="text-sm mb-2" style={{ color: '#717182' }}>Revenue generated from diagnostic tests.</div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium" style={{ color: '#101828' }}>₹1,178 avg per test</span>
                     <div className="flex items-center text-sm text-green-600">
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                       </svg>
                       +12.5% vs last month
                     </div>
                   </div>
                   <div className="w-full bg-purple-500 h-2 rounded-full" style={{ width: '87.5%' }}></div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="text-center">
                     <div className="text-lg font-bold text-green-600">₹3,45,000</div>
                     <div className="text-xs" style={{ color: '#717182' }}>COLLECTED</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-blue-600">₹25,000</div>
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
                 <p className="text-sm mb-4" style={{ color: '#717182' }}>Hover over bars to see detailed information</p>
                 <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={testTypesData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="name" />
                     <YAxis />
                     <Tooltip />
                     <Bar dataKey="tests" fill="#3B82F6" />
                   </BarChart>
                 </ResponsiveContainer>
               </div>

               {/* Hearing Loss Distribution */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Hearing Loss Distribution</h3>
                 <p className="text-sm mb-4" style={{ color: '#717182' }}>Patient hearing assessment results</p>
                 <ResponsiveContainer width="100%" height={300}>
                   <PieChart>
                     <Pie
                       data={hearingLossDistributionData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={120}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {hearingLossDistributionData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip />
                     <Legend />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
             </div>
           </div>
         )}

        {activeTab === 'hearing-aid' && (
          <div className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                             {/* Hearing Aids Sold */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Hearing Aids Sold</h3>
                   <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                 </div>
                 <div className="mb-4">
                   <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>142</div>
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
                     <div className="text-lg font-bold text-green-600">125</div>
                     <div className="text-xs" style={{ color: '#717182' }}>ON TIME DELIVERY</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-red-600">17</div>
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
                   <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>₹18,52,500</div>
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
                     <div className="text-lg font-bold text-green-600">₹17,50,000</div>
                     <div className="text-xs" style={{ color: '#717182' }}>COLLECTED</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-blue-600">₹1,02,500</div>
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
                   <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>₹13,046</div>
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
                   <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>68%</div>
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
                     <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
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
                  <LineChart data={monthlySalesTrendData}>
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
                      data={hatDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {hatDistributionData.map((entry, index) => (
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
                      data={binauralDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {binauralDistributionData.map((entry, index) => (
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
                      data={binauralModelsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="units"
                    >
                      {binauralModelsData.map((entry, index) => (
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
                      data={monauralModelsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="units"
                    >
                      {monauralModelsData.map((entry, index) => (
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
          </div>
                 )}

         {activeTab === 'billings' && (
           <div className="space-y-6">
             {/* Top Row - Transaction Analytics */}
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
               {/* Transaction Analytics */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Transaction Analytics</h3>
                   <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                 </div>
                 <div className="mb-4">
                   <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>156</div>
                   <div className="text-sm mb-2" style={{ color: '#717182' }}>Total invoices generated this month.</div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium" style={{ color: '#101828' }}>Average Invoice: ₹2.5K</span>
                     <div className="flex items-center text-sm text-green-600">
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                       </svg>
                       +12% efficiency
                     </div>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                   </div>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                   <div className="text-center">
                     <div className="text-lg font-bold text-green-600">₹69.7K</div>
                     <div className="text-xs" style={{ color: '#717182' }}>GST COLLECTED</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-orange-600">18%</div>
                     <div className="text-xs" style={{ color: '#717182' }}>DISCOUNT RATE</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-purple-600">₹12.4K</div>
                     <div className="text-xs" style={{ color: '#717182' }}>COMMISSION</div>
                   </div>
                 </div>
               </div>

               {/* GST Collected */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>GST Collected</h3>
                   <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                 </div>
                 <div className="mb-4">
                   <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>₹69.7K</div>
                   <div className="text-sm mb-2" style={{ color: '#717182' }}>18% of total revenue.</div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium" style={{ color: '#101828' }}>₹2.5K average per invoice</span>
                     <div className="flex items-center text-sm text-green-600">
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                       </svg>
                       +8% vs last month
                     </div>
                   </div>
                   <div className="w-full bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="text-center">
                     <div className="text-lg font-bold text-green-600">₹65.2K</div>
                     <div className="text-xs" style={{ color: '#717182' }}>COLLECTED</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-blue-600">₹4.5K</div>
                     <div className="text-xs" style={{ color: '#717182' }}>PENDING</div>
                   </div>
                 </div>
               </div>

               {/* Commission Paid */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Commission Paid</h3>
                   <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                 </div>
                 <div className="mb-4">
                   <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>₹12.4K</div>
                   <div className="text-sm mb-2" style={{ color: '#717182' }}>To referring doctors.</div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium" style={{ color: '#101828' }}>3.2% of total revenue</span>
                     <div className="flex items-center text-sm text-green-600">
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                       </svg>
                       +5% vs last month
                     </div>
                   </div>
                   <div className="w-full bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="text-center">
                     <div className="text-lg font-bold text-green-600">₹11.8K</div>
                     <div className="text-xs" style={{ color: '#717182' }}>PAID</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-blue-600">₹0.6K</div>
                     <div className="text-xs" style={{ color: '#717182' }}>PENDING</div>
                   </div>
                 </div>
               </div>

               {/* Discount Given */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Discount Given</h3>
                   <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                 </div>
                 <div className="mb-4">
                   <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>18%</div>
                   <div className="text-sm mb-2" style={{ color: '#717182' }}>Average discount rate.</div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium" style={{ color: '#101828' }}>₹68.4K total discounts</span>
                     <div className="flex items-center text-sm text-orange-600">
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                       </svg>
                       Target: 15%
                     </div>
                   </div>
                   <div className="w-full bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="text-center">
                     <div className="text-lg font-bold text-orange-600">₹68.4K</div>
                     <div className="text-xs" style={{ color: '#717182' }}>TOTAL DISCOUNT</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-blue-600">₹438</div>
                     <div className="text-xs" style={{ color: '#717182' }}>AVG PER INVOICE</div>
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
                 
                 {/* Summary Box */}
                 <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                   <div className="text-center">
                     <div className="text-sm font-medium" style={{ color: '#101828' }}>Cash</div>
                     <div className="text-xs" style={{ color: '#717182' }}>Most Popular</div>
                     <div className="text-lg font-bold text-blue-600">45%</div>
                   </div>
                   <div className="text-center">
                     <div className="text-sm font-medium" style={{ color: '#101828' }}>Digital Payments</div>
                     <div className="text-xs" style={{ color: '#717182' }}>Card + UPI + Transfer</div>
                     <div className="text-lg font-bold text-green-600">55%</div>
                   </div>
                   <div className="text-center">
                     <div className="text-sm font-medium" style={{ color: '#101828' }}>Average Transaction</div>
                     <div className="text-xs" style={{ color: '#717182' }}>Per payment</div>
                     <div className="text-lg font-bold text-purple-600">₹2.3K</div>
                   </div>
                 </div>

                 <ResponsiveContainer width="100%" height={250}>
                   <PieChart>
                     <Pie
                       data={paymentMethodData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={100}
                       paddingAngle={5}
                       dataKey="percentage"
                     >
                       {paymentMethodData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip />
                     <Legend />
                   </PieChart>
                 </ResponsiveContainer>

                 {/* Payment Details */}
                 <div className="mt-4 space-y-2">
                   {paymentMethodData.map((method, index) => (
                     <div key={index} className="flex justify-between items-center text-sm">
                       <span style={{ color: '#717182' }}>{method.name}:</span>
                       <span className="font-medium" style={{ color: '#101828' }}>
                         ₹{method.amount.toLocaleString()} ({method.percentage}%)
                       </span>
                     </div>
                   ))}
                 </div>

                 <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                   <div className="text-sm font-medium text-blue-800">
                     Digital payments represent 55% of transactions, showing growing adoption
                   </div>
                   <div className="text-xs text-blue-600">156 Total transactions</div>
                 </div>
               </div>

               {/* Revenue Breakdown by Service Categories */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Revenue Breakdown by Service Categories</h3>
                 <p className="text-sm mb-4" style={{ color: '#717182' }}>Detailed breakdown of revenue by service types</p>
                 
                 <ResponsiveContainer width="100%" height={250}>
                   <BarChart data={revenueBreakdownData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="name" />
                     <YAxis />
                     <Tooltip />
                     <Bar dataKey="revenue" fill="#3B82F6" />
                   </BarChart>
                 </ResponsiveContainer>

                 {/* Detailed Breakdown */}
                 <div className="mt-4 space-y-2">
                   {revenueBreakdownData.map((service, index) => (
                     <div key={index} className="flex justify-between items-center text-sm">
                       <span style={{ color: '#717182' }}>{service.name}:</span>
                       <span className="font-medium" style={{ color: '#101828' }}>
                         ₹{service.revenue}L ({service.percentage}%)
                       </span>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

             {/* Bottom Row - Additional Charts */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Customer Age Distribution */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Customer Age Distribution</h3>
                 <p className="text-sm mb-4" style={{ color: '#717182' }}>Patient demographics by age groups</p>
                 
                 <ResponsiveContainer width="100%" height={250}>
                   <PieChart>
                     <Pie
                       data={customerAgeData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={100}
                       paddingAngle={5}
                       dataKey="percentage"
                     >
                       {customerAgeData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip />
                     <Legend />
                   </PieChart>
                 </ResponsiveContainer>

                 {/* Age Group Details */}
                 <div className="mt-4 space-y-2">
                   {customerAgeData.map((age, index) => (
                     <div key={index} className="flex justify-between items-center text-sm">
                       <span style={{ color: '#717182' }}>{age.name}:</span>
                       <span className="font-medium" style={{ color: '#101828' }}>
                         {age.patients} patients ({age.percentage}%)
                       </span>
                     </div>
                   ))}
                 </div>

                 <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                   <div className="text-sm font-medium text-purple-800">
                     45.5% of patients are 61+ years old
                   </div>
                   <div className="text-xs text-purple-600">156 Total patients</div>
                 </div>
               </div>

               {/* Revenue vs Collection Trend */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Revenue vs Collection Trend</h3>
                 <p className="text-sm mb-4" style={{ color: '#717182' }}>Monthly revenue and collection performance</p>
                 
                 <ResponsiveContainer width="100%" height={250}>
                   <BarChart data={revenueCollectionTrendData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="month" />
                     <YAxis />
                     <Tooltip />
                     <Legend />
                     <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                     <Bar dataKey="collection" fill="#10B981" name="Collection" />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             </div>

             {/* Collection Timeline Performance */}
             <div className="bg-white rounded-lg border border-border p-6">
               <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Collection Timeline Performance</h3>
               <p className="text-sm mb-4" style={{ color: '#717182' }}>Payment collection efficiency metrics</p>
               
               {/* Summary Metrics */}
               <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="p-3 bg-purple-50 rounded-lg">
                   <div className="text-sm font-medium text-purple-800">Average Days to collect payment</div>
                   <div className="text-2xl font-bold text-purple-600">2.3 days</div>
                 </div>
                 <div className="p-3 bg-green-50 rounded-lg">
                   <div className="text-sm font-medium text-green-800">Same Day payment rate</div>
                   <div className="text-2xl font-bold text-green-600">85%</div>
                 </div>
               </div>

               {/* Collection Progress Bars */}
               <div className="space-y-4">
                 {collectionTimelineData.map((item, index) => (
                   <div key={index}>
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-medium" style={{ color: '#101828' }}>{item.timeline}</span>
                       <span className="text-sm font-bold" style={{ color: item.color }}>{item.percentage}%</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-3">
                       <div 
                         className="h-3 rounded-full" 
                         style={{ 
                           width: `${item.percentage}%`, 
                           backgroundColor: item.color 
                         }}
                       ></div>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="mt-4 flex items-center justify-between">
                 <span className="text-sm" style={{ color: '#717182' }}>Collection Efficiency</span>
                 <div className="flex items-center text-sm text-green-600">
                   <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                   </svg>
                   +12% improvement
                 </div>
               </div>
             </div>
           </div>
         )}

                  {activeTab === 'inventory' && (
           <div className="space-y-6">
             {/* Top Row - Key Metrics */}
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
               {/* Total Inventory Value */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Total Inventory Value</h3>
                   <span className="text-sm" style={{ color: '#717182' }}>Current assets</span>
                 </div>
                 <div className="mb-4">
                   <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>₹2,45,000</div>
                   <div className="text-sm mb-2" style={{ color: '#717182' }}>Total value of current inventory.</div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium" style={{ color: '#101828' }}>₹1,850 avg per item</span>
                     <div className="flex items-center text-sm text-green-600">
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                       </svg>
                       +8% vs last month
                     </div>
                   </div>
                   <div className="w-full bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="text-center">
                     <div className="text-lg font-bold text-green-600">₹2,20,000</div>
                     <div className="text-xs" style={{ color: '#717182' }}>HEARING AIDS</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-blue-600">₹25,000</div>
                     <div className="text-xs" style={{ color: '#717182' }}>ACCESSORIES</div>
                   </div>
                 </div>
               </div>

               {/* Low Stock Items */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Low Stock Items</h3>
                   <span className="text-sm" style={{ color: '#717182' }}>Reorder recommended</span>
                 </div>
                 <div className="mb-4">
                   <div className="text-3xl font-bold mb-2" style={{ color: '#F59E0B' }}>2</div>
                   <div className="text-sm mb-2" style={{ color: '#717182' }}>Items below reorder level.</div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium" style={{ color: '#101828' }}>Size 312 Batteries, Wax Guards</span>
                     <div className="flex items-center text-sm text-orange-600">
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                       </svg>
                       Action required
                     </div>
                   </div>
                   <div className="w-full bg-orange-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="text-center">
                     <div className="text-lg font-bold text-orange-600">2</div>
                     <div className="text-xs" style={{ color: '#717182' }}>LOW STOCK</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-green-600">15</div>
                     <div className="text-xs" style={{ color: '#717182' }}>IN STOCK</div>
                   </div>
                 </div>
               </div>

               {/* Out of Stock */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Out of Stock</h3>
                   <span className="text-sm" style={{ color: '#717182' }}>Critical shortage</span>
                 </div>
                 <div className="mb-4">
                   <div className="text-3xl font-bold mb-2" style={{ color: '#EF4444' }}>2</div>
                   <div className="text-sm mb-2" style={{ color: '#717182' }}>Items completely out of stock.</div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium" style={{ color: '#101828' }}>BTE Receivers, Cleaning Tools</span>
                     <div className="flex items-center text-sm text-red-600">
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                       Critical shortage
                     </div>
                   </div>
                   <div className="w-full bg-red-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="text-center">
                     <div className="text-lg font-bold text-red-600">2</div>
                     <div className="text-xs" style={{ color: '#717182' }}>OUT OF STOCK</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-green-600">17</div>
                     <div className="text-xs" style={{ color: '#717182' }}>IN STOCK</div>
                   </div>
                 </div>
               </div>

               {/* Expiring Soon */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Expiring Soon</h3>
                   <span className="text-sm" style={{ color: '#717182' }}>Action required</span>
                 </div>
                 <div className="mb-4">
                   <div className="text-3xl font-bold mb-2" style={{ color: '#F59E0B' }}>1</div>
                   <div className="text-sm mb-2" style={{ color: '#717182' }}>Items expiring within 30 days.</div>
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium" style={{ color: '#101828' }}>Size 13 Batteries</span>
                     <div className="flex items-center text-sm text-orange-600">
                       <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       Expires in 15 days
                     </div>
                   </div>
                   <div className="w-full bg-orange-500 h-2 rounded-full" style={{ width: '2%' }}></div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="text-center">
                     <div className="text-lg font-bold text-orange-600">1</div>
                     <div className="text-xs" style={{ color: '#717182' }}>EXPIRING</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-green-600">18</div>
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
                 
                 <ResponsiveContainer width="100%" height={300}>
                   <PieChart>
                     <Pie
                       data={currentStockStatusData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={120}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {currentStockStatusData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip />
                     <Legend />
                   </PieChart>
                 </ResponsiveContainer>
               </div>

               {/* Stock Level Trend by Category */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Stock Level Trend by Category</h3>
                 <p className="text-sm mb-4" style={{ color: '#717182' }}>Inventory patterns over time</p>
                 
                 <ResponsiveContainer width="100%" height={300}>
                   <LineChart data={stockLevelTrendData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="month" />
                     <YAxis />
                     <Tooltip />
                     <Legend />
                     <Line type="monotone" dataKey="accessories" stroke="#F59E0B" name="Accessories" />
                     <Line type="monotone" dataKey="hearingAids" stroke="#3B82F6" name="Hearing Aids" />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             </div>

             {/* Bottom Row - Additional Charts */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Best Selling Brands */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Best Selling Brands</h3>
                 <p className="text-sm mb-4" style={{ color: '#717182' }}>Top performing hearing aid brands by sales volume</p>
                 
                 <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={bestSellingBrandsData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="name" />
                     <YAxis />
                     <Tooltip />
                     <Bar dataKey="sales" fill="#3B82F6" />
                   </BarChart>
                 </ResponsiveContainer>
               </div>

               {/* Stockout Frequency Analysis */}
               <div className="bg-white rounded-lg border border-border p-6">
                 <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Stockout Frequency Analysis</h3>
                 <p className="text-sm mb-4" style={{ color: '#717182' }}>Critical for reorder level optimization</p>
                 
                 <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={stockoutFrequencyData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="item" angle={-45} textAnchor="end" height={80} />
                     <YAxis />
                     <Tooltip />
                     <Bar dataKey="frequency" fill="#EF4444" />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             </div>
           </div>
         )}

         {/* Placeholder for other tabs */}
         {activeTab !== 'appointments' && activeTab !== 'doctor-referral' && activeTab !== 'diagnostics' && activeTab !== 'hearing-aid' && activeTab !== 'billings' && activeTab !== 'inventory' && (
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
