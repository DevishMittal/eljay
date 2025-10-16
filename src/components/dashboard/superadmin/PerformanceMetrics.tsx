/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { PerformanceMetricsData } from '@/services/superAdminDashboardService';

interface PerformanceMetricsProps {
  data: PerformanceMetricsData;
}

// Color scheme for charts
const COLORS = {
  primary: '#3b82f6', // Blue
  secondary: '#10b981', // Green
  tertiary: '#f59e0b', // Orange
  accent: '#8b5cf6', // Purple
  danger: '#ef4444', // Red
  success: '#22c55e', // Light green
  warning: '#f59e0b', // Yellow
  info: '#06b6d4', // Cyan
};

// Channel colors
const CHANNEL_COLORS = {
  'Direct Walk-ins': '#3b82f6', // Blue
  'Doctor Referral': '#10b981', // Green
  'Hearsum': '#f59e0b', // Orange
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-IN').format(value);
};

export default function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  // Transform conversion funnel data for funnel chart
  const funnelData = data.conversionFunnel.stages.map((stage, index) => ({
    name: stage.name,
    value: stage.count,
    fill: index === 0 ? COLORS.primary : 
          index === 1 ? COLORS.secondary : 
          index === 2 ? COLORS.tertiary : COLORS.accent
  }));

  // Transform branch-wise funnel data for bar chart
  const branchFunnelData = data.conversionFunnel.branchWise.length > 0 
    ? data.conversionFunnel.branchWise.map(branch => ({
        branch: branch.branch || 'Network',
        hatTrials: branch.hatTrials || 0,
        finalPurchases: branch.finalPurchases || 0
      }))
    : [
        { branch: 'Main Branch', hatTrials: 0, finalPurchases: 0 },
        { branch: 'North Side', hatTrials: 0, finalPurchases: 0 },
        { branch: 'South Side', hatTrials: 0, finalPurchases: 0 },
        { branch: 'East Wing', hatTrials: 0, finalPurchases: 0 },
        { branch: 'Central Plaza', hatTrials: 0, finalPurchases: 0 }
      ];

  // Transform hearing aid sales by channels data
  const channelPieData = data.hearingAidSalesByChannels.pie.length > 0
    ? data.hearingAidSalesByChannels.pie.map(item => ({
        name: item.name,
        value: item.percentage,
        units: item.units || 0,
        fill: CHANNEL_COLORS[item.name as keyof typeof CHANNEL_COLORS] || COLORS.primary
      }))
    : [
        { name: 'Direct Walk-ins', value: 0, units: 0, fill: CHANNEL_COLORS['Direct Walk-ins'] },
        { name: 'Doctor Referral', value: 0, units: 0, fill: CHANNEL_COLORS['Doctor Referral'] },
        { name: 'Hearsum', value: 0, units: 0, fill: CHANNEL_COLORS['Hearsum'] }
      ];

  const channelTrendsData = data.hearingAidSalesByChannels.trends.length > 0
    ? data.hearingAidSalesByChannels.trends.map(trend => ({
        month: trend.month,
        'Direct Walk-ins': trend.directWalkIns || 0,
        'Doctor Referral': trend.doctorReferral || 0,
        'Hearsum': trend.hearsum || 0
      }))
    : [
        { month: 'Jan', 'Direct Walk-ins': 0, 'Doctor Referral': 0, 'Hearsum': 0 },
        { month: 'Feb', 'Direct Walk-ins': 0, 'Doctor Referral': 0, 'Hearsum': 0 },
        { month: 'Mar', 'Direct Walk-ins': 0, 'Doctor Referral': 0, 'Hearsum': 0 },
        { month: 'Apr', 'Direct Walk-ins': 0, 'Doctor Referral': 0, 'Hearsum': 0 },
        { month: 'May', 'Direct Walk-ins': 0, 'Doctor Referral': 0, 'Hearsum': 0 },
        { month: 'Jun', 'Direct Walk-ins': 0, 'Doctor Referral': 0, 'Hearsum': 0 }
      ];

  return (
    <div className="space-y-6">

      {/* Top Row - Hospital Performance Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hospital Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Summary Stats */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(data.hospitalPerformanceOverview.totalHospitals)}
                </div>
                <div className="text-sm text-blue-600">Total Hospitals</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.hospitalPerformanceOverview.totalRevenue)}
                </div>
                <div className="text-sm text-green-600">Total Revenue</div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(data.hospitalPerformanceOverview.totalTests)}
              </div>
              <div className="text-sm text-purple-600">Total Tests</div>
            </div>
          </div>

          {/* Top Performers */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Top Performers by Revenue</h4>
            <div className="space-y-2">
              {data.hospitalPerformanceOverview.topPerformers.length > 0 ? (
                data.hospitalPerformanceOverview.topPerformers.map((performer, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{performer.name}</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(performer.revenue)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No hospital performance data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row - Hearing Aid Sales by Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border relative">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hearing Aid Sales by Channels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={channelPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => value && value > 0 ? `${name}: ${value.toFixed(1)}%` : ''}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {channelPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} opacity={entry.value > 0 ? 1 : 0.3} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  value > 0 ? `${value.toFixed(1)}%` : 'No data',
                  `${name} (${formatNumber(props.payload.units)} units)`
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          {channelPieData.every(item => item.value === 0) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <p className="text-sm text-gray-500">No channel sales data available</p>
            </div>
          )}
        </div>

        {/* Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border relative">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Sales Volume by Channel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={channelTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatNumber(value),
                  name
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Direct Walk-ins" 
                stroke={CHANNEL_COLORS['Direct Walk-ins']} 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Doctor Referral" 
                stroke={CHANNEL_COLORS['Doctor Referral']} 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Hearsum" 
                stroke={CHANNEL_COLORS['Hearsum']} 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          {channelTrendsData.every(item => 
            item['Direct Walk-ins'] === 0 && item['Doctor Referral'] === 0 && item['Hearsum'] === 0
          ) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <p className="text-sm text-gray-500">No trend data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row - Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData} layout="horizontal">
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatNumber(value),
                  'Count'
                ]}
              />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel Performance Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Funnel Performance</h3>
          <div className="space-y-4">
            {/* HAT Funnel */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">HAT (Hearing Aid Trial) Funnel</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="font-bold text-blue-600">{formatNumber(data.funnel.totalAppointments)}</div>
                  <div className="text-gray-600">Total</div>
                </div>
                <div>
                  <div className="font-bold text-green-600">100%</div>
                  <div className="text-gray-600">Trial</div>
                </div>
                <div>
                  <div className="font-bold text-purple-600">75%</div>
                  <div className="text-gray-600">Conversion</div>
                </div>
              </div>
            </div>

            {/* HAT Advance Payment Funnel */}
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">HAT (Advance Payment) Funnel</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="font-bold text-blue-600">550</div>
                  <div className="text-gray-600">Total</div>
                </div>
                <div>
                  <div className="font-bold text-green-600">78.1%</div>
                  <div className="text-gray-600">Trial</div>
                </div>
                <div>
                  <div className="font-bold text-purple-600">66.4%</div>
                  <div className="text-gray-600">Conversion</div>
                </div>
              </div>
            </div>

            {/* HAT Short Sales Funnel */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">HAT (Short Sales) Funnel</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="font-bold text-blue-600">400</div>
                  <div className="text-gray-600">Total</div>
                </div>
                <div>
                  <div className="font-bold text-green-600">100%</div>
                  <div className="text-gray-600">Trial</div>
                </div>
                <div>
                  <div className="font-bold text-purple-600">100%</div>
                  <div className="text-gray-600">Conversion</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Branch-wise Funnel Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Branch-wise Funnel Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={branchFunnelData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="branch" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis fontSize={12} />
            <Tooltip 
              formatter={(value: number, name: string) => [
                formatNumber(value),
                name
              ]}
            />
            <Legend />
            <Bar dataKey="hatTrials" stackId="a" fill={COLORS.primary} name="HAT Trials" />
            <Bar dataKey="finalPurchases" stackId="a" fill={COLORS.secondary} name="Final Purchases" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Branch Cards - Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.branchCards.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Revenue</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(data.branchCards.availableUnits)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Available Units</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(data.branchCards.lowStockItems)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Low Stock Items</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(data.branchCards.outOfStockItems)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Out of Stock Items</div>
          </div>
        </div>
      </div>
    </div>
  );
}
