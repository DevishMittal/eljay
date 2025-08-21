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

        {/* Placeholder for other tabs */}
        {activeTab !== 'appointments' && (
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
