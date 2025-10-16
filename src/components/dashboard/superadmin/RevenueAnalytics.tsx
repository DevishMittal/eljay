'use client';

import { 
  BarChart, Bar, LineChart, Line, ComposedChart, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { RevenueAnalyticsData } from '@/services/superAdminDashboardService';

interface RevenueAnalyticsProps {
  data: RevenueAnalyticsData;
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

// Brand colors for diagnostics
const DIAGNOSTIC_COLORS = {
  BERA: '#f59e0b', // Orange
  OAE: '#10b981', // Green
  PTA: '#3b82f6', // Blue
  Tinnitus: '#8b5cf6', // Purple
};

// Brand colors for market share
const BRAND_COLORS = {
  Phonak: '#3b82f6',
  Oticon: '#10b981',
  Widex: '#f59e0b',
  Signia: '#8b5cf6',
  ReSound: '#ef4444',
  Others: '#6b7280',
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

export default function RevenueAnalytics({ data }: RevenueAnalyticsProps) {
  // Transform data for diagnostics revenue stacked chart
  const diagnosticsChartData = data.diagnosticsRevenueByCentre.map(item => ({
    branch: item.branch,
    BERA: item.hearing, // Using hearing for BERA as per doc
    OAE: item.pediatric,
    PTA: item.hearing * 0.6, // Estimated split
    Tinnitus: item.vertigo,
  }));

  // Mock target data for performance vs targets line
  const hearingAidWithTargets = data.hearingAidRevenueByCentre.map(item => ({
    ...item,
    target: item.revenue * 1.2, // Mock 20% higher target
  }));

  return (
    <div className="space-y-6">

      {/* Branch Performance Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(data.branchPerformanceStats.totalUnitsSold)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Units Sold</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(data.branchPerformanceStats.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Revenue</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(data.branchPerformanceStats.avgUnitPrice)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Avg Unit Price</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hearing Aid Revenue by Centre */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hearing Aid Revenue by Centre</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={hearingAidWithTargets}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="branch" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'target' ? formatCurrency(value) : formatCurrency(value),
                  name === 'target' ? 'Target' : 'Revenue'
                ]}
              />
              <Legend />
              <Bar dataKey="revenue" fill={COLORS.primary} name="Revenue" />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke={COLORS.danger} 
                strokeWidth={2}
                name="Performance vs Target"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Diagnostics Revenue by Centre */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Diagnostics Revenue by Centre</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={diagnosticsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="branch" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name
                ]}
              />
              <Legend />
              <Bar dataKey="BERA" stackId="a" fill={DIAGNOSTIC_COLORS.BERA} />
              <Bar dataKey="OAE" stackId="a" fill={DIAGNOSTIC_COLORS.OAE} />
              <Bar dataKey="PTA" stackId="a" fill={DIAGNOSTIC_COLORS.PTA} />
              <Bar dataKey="Tinnitus" stackId="a" fill={DIAGNOSTIC_COLORS.Tinnitus} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hearing Aid Volume by Branch */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hearing Aid Volume by Branch</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.hearingAidVolumeByBranch}>
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
                formatter={(value: number) => [formatNumber(value), 'Units']}
              />
              <Bar dataKey="volume" fill={COLORS.secondary} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hearing Aid Revenue by Branch */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hearing Aid Revenue by Branch</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.hearingAidRevenueByBranch}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="branch" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              />
              <Bar dataKey="revenue" fill={COLORS.accent} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
