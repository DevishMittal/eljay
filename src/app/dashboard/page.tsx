'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [timeFilter, setTimeFilter] = useState('Last 30 Days');

  // Mock data for charts
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

  const tabs = [
    { id: 'appointments', label: 'Appointments' },
    { id: 'doctor-referral', label: 'Doctor Referral' },
    { id: 'diagnostics', label: 'Diagnostics' },
    { id: 'hearing-aid', label: 'Hearing Aid' },
    { id: 'billings', label: 'Billings' },
    { id: 'inventory', label: 'Inventory' }
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
          <div className="flex items-center space-x-2 px-3 py-2 border border-border rounded-lg bg-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
                         <select 
               value={timeFilter} 
               onChange={(e) => setTimeFilter(e.target.value)}
               className="text-sm border-none outline-none bg-transparent"
               style={{ color: '#101828' }}
               aria-label="Select time period"
             >
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg border border-border p-1">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {/* Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Appointments Overview */}
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Appointments Overview</h3>
                  <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>167</div>
                  <div className="text-sm mb-2" style={{ color: '#717182' }}>Total appointments this month.</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: '#101828' }}>89.2% completed</span>
                    <div className="flex items-center text-sm text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      20.77% vs last month
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '89.2%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">149</div>
                    <div className="text-xs" style={{ color: '#717182' }}>COMPLETED</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">12</div>
                    <div className="text-xs" style={{ color: '#717182' }}>PENDING</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">6</div>
                    <div className="text-xs" style={{ color: '#717182' }}>CANCELLED</div>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Performance</h3>
                  <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold" style={{ color: '#101828' }}>89.2%</div>
                    <div className="text-xs" style={{ color: '#717182' }}>ATTENDANCE RATE</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold" style={{ color: '#101828' }}>67%</div>
                    <div className="text-xs" style={{ color: '#717182' }}>REPEAT PATIENTS</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold" style={{ color: '#101828' }}>4.2%</div>
                    <div className="text-xs" style={{ color: '#717182' }}>NO-SHOW RATE</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold" style={{ color: '#101828' }}>4.2</div>
                    <div className="text-xs" style={{ color: '#717182' }}>AVG LEAD DAYS</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span style={{ color: '#717182' }}>89.2% of target</span>
                    <span style={{ color: '#717182' }}>Target: 90%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '89.2%' }}></div>
                  </div>
                  <div className="text-sm text-green-600 mt-1">Below target</div>
                </div>
              </div>

              {/* Utilization Rate */}
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#101828' }}>Utilization Rate</h3>
                  <span className="text-sm" style={{ color: '#717182' }}>This Month</span>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold mb-2" style={{ color: '#101828' }}>78%</div>
                  <div className="text-sm mb-2" style={{ color: '#717182' }}>Overall</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold" style={{ color: '#101828' }}>85%</div>
                    <div className="text-xs" style={{ color: '#717182' }}>AUDIOLOGIST AVG</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold" style={{ color: '#101828' }}>92%</div>
                    <div className="text-xs" style={{ color: '#717182' }}>PEAK HOUR</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#717182' }}>Optimal: 80-85%</span>
                  <div className="flex items-center text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    +5% vs last month
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm mr-2" style={{ color: '#717182' }}>Resource efficiency</span>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Low</span>
                </div>
              </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointment Status Distribution */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Appointment Status Distribution</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>Current month breakdown</p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {appointmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Appointment Trends */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Appointment Trends (6 Months)</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>Monthly performance tracking</p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={appointmentTrendsData}>
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
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Audiologist Performance */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#101828' }}>Audiologist Performance</h3>
                <p className="text-sm mb-4" style={{ color: '#717182' }}>This month appointments handled</p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={audiologistPerformanceData}>
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
                      data={channelDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {channelDistributionData.map((entry, index) => (
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
                  <BarChart data={bookingLeadTimeData}>
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
                <LineChart data={attendanceRateData}>
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
                <p className="text-sm mb-4" style={{ color: '#717182' }}>This month's top performers</p>
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

        {/* Placeholder for other tabs */}
        {activeTab !== 'appointments' && activeTab !== 'doctor-referral' && (
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
