/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter,
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
  const branchFunnelData = data.conversionFunnel.branchWise.map(branch => ({
        branch: branch.branch || 'Network',
        hatTrials: branch.hatTrials || 0,
        finalPurchases: branch.finalPurchases || 0
  }));

  // Transform hearing aid sales by channels data
  const channelPieData = data.hearingAidSalesByChannels.pie.map(item => ({
        name: item.name,
        value: item.percentage,
        units: item.units || 0,
        fill: CHANNEL_COLORS[item.name as keyof typeof CHANNEL_COLORS] || COLORS.primary
  }));

  const channelTrendsData = data.hearingAidSalesByChannels.trends.map(trend => ({
        month: trend.month,
        'Direct Walk-ins': trend.directWalkIns || 0,
        'Doctor Referral': trend.doctorReferral || 0,
        'Hearsum': trend.hearsum || 0
  }));

  return (
    <div className="space-y-6">
      {/* Diagnosis vs Consult Scatter Plot - Only show if data is available */}
      {data.diagnosisVsConsultScatter.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Diagnosis vs Consult: Value & Quantity</h3>
          <p className="text-sm text-gray-600 mb-4">Correlation between consultation quantity and diagnosis value</p>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={data.diagnosisVsConsultScatter}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="consultQuantity" 
                  name="Consult (Quantity)"
                  domain={[0, 150]}
                  fontSize={12}
                />
                <YAxis 
                  type="number" 
                  dataKey="diagnosisValue" 
                  name="Diagnosis (Value)"
                  domain={[0, 6000000]}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  fontSize={12}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value: number, name: string) => [
                    name === 'diagnosisValue' ? formatCurrency(value) : formatNumber(value),
                    name === 'diagnosisValue' ? 'Diagnosis Value' : 'Consult Quantity'
                  ]}
                />
                <Scatter dataKey="diagnosisValue" fill={COLORS.primary} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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

      {/* Middle Row - Hearing Aid Sales by Channels - Only show if data is available */}
      {(data.hearingAidSalesByChannels.pie.length > 0 || data.hearingAidSalesByChannels.trends.length > 0) && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
          {data.hearingAidSalesByChannels.pie.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
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
            </div>
          )}

        {/* Line Chart */}
          {data.hearingAidSalesByChannels.trends.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
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
            </div>
          )}
        </div>
      )}

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
                formatter={(value: number) => [
                  formatNumber(value),
                  'Count'
                ]}
              />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel Performance Metrics - Only show if data is available */}
        {(data.funnel.totalAppointments > 0 || data.funnel.completedConsultations > 0 || data.funnel.hatTrials > 0 || data.funnel.purchasesCompleted > 0) && (
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
                    <div className="font-bold text-green-600">
                      {data.funnel.totalAppointments > 0 ? ((data.funnel.hatTrials / data.funnel.totalAppointments) * 100).toFixed(1) : 0}%
                    </div>
                  <div className="text-gray-600">Trial</div>
                </div>
                <div>
                    <div className="font-bold text-purple-600">
                      {data.funnel.hatTrials > 0 ? ((data.funnel.purchasesCompleted / data.funnel.hatTrials) * 100).toFixed(1) : 0}%
                </div>
                  <div className="text-gray-600">Conversion</div>
                </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Branch-wise Funnel Performance - Only show if data is available */}
      {data.conversionFunnel.branchWise.length > 0 && (
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
      )}

      {/* Current Stock Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.branchCards.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Stock Value</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(data.branchCards.availableUnits)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Stock Items</div>
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
            <div className="text-sm text-gray-600 mt-1">Out of Stock</div>
          </div>
        </div>
      </div>

      {/* Stock Status Distribution by Branch */}
      {data.stockStatusDistributionByBranch.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Stock Status Distribution by Branch</h3>
          <p className="text-sm text-gray-600 mb-4">Distribution of stock levels across all branches</p>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stockStatusDistributionByBranch}>
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
                    name === 'inStock' ? 'In Stock' : 
                    name === 'lowStock' ? 'Low Stock' : 'Out of Stock'
                  ]}
                />
                <Legend />
                <Bar dataKey="inStock" stackId="a" fill={COLORS.success} name="In Stock" />
                <Bar dataKey="lowStock" stackId="a" fill={COLORS.warning} name="Low Stock" />
                <Bar dataKey="outOfStock" stackId="a" fill={COLORS.danger} name="Out of Stock" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Stock Level Trend by Category */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {data.stockLevelByCategory.map((category, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {formatNumber(category.currentStock)}
              </div>
              <div className="text-sm text-gray-600 mt-1">{category.category}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 6-Month Stock Level Trends */}
      {data.stockTrends6Months.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">6-Month Stock Level Trends</h3>
          <p className="text-sm text-gray-600 mb-4">Stock level trends over the last 6 months by category</p>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.stockTrends6Months}>
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
                  dataKey="Hearing Aids" 
                  stroke={COLORS.primary} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Accessories" 
                  stroke={COLORS.tertiary} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Batteries" 
                  stroke={COLORS.success} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Instruments" 
                  stroke={COLORS.accent} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Stockout Frequency Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(data.stockoutFrequency.totalEvents)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Stockout Events</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.stockoutFrequency.lostSalesValue)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Lost Sales Value</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {data.stockoutFrequency.avgDurationDays.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Avg. Duration (Days)</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {data.stockoutFrequency.avgRecoveryDays.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Avg. Recovery (Days)</div>
          </div>
        </div>
      </div>

      {/* Stockout Events by Branch */}
      {data.stockoutFrequency.eventsByBranch.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Stockout Events by Branch</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.stockoutFrequency.eventsByBranch}>
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
                    formatter={(value: number) => [formatNumber(value), 'Events']}
                  />
                  <Bar dataKey="events" fill={COLORS.danger} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lost Sales Impact</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.stockoutFrequency.lostSalesByBranch}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="branch" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Lost Sales']}
                  />
                  <Bar dataKey="lostSales" fill={COLORS.tertiary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Expired Items Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(data.expiredItemsOverview.expiredCount)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Expired Items</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.expiredItemsOverview.expiredValue)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Expired Value</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(data.expiredItemsOverview.nearExpiryCount)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Near Expiry Items</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.expiredItemsOverview.nearExpiryValue)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Near Expiry Value</div>
          </div>
        </div>
      </div>

      {/* Expired Items by Branch */}
      {data.expiredItemsByBranch.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Expired Items by Branch</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.expiredItemsByBranch}>
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
                  formatter={(value: number) => [formatNumber(value), 'Expired Items']}
                />
                <Bar dataKey="expiredItems" fill={COLORS.danger} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Financial Impact by Branch */}
      {data.expiredItemsByBranch.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Impact by Branch</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.expiredItemsByBranch}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="branch" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'expiredValue' ? 'Expired Value' : 'Near Expiry Value'
                  ]}
                />
                <Legend />
                <Bar dataKey="expiredValue" stackId="a" fill={COLORS.danger} name="Expired Value" />
                <Bar dataKey="nearExpiryValue" stackId="a" fill={COLORS.tertiary} name="Near Expiry Value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Expired Items Report */}
      {data.expiredItemsTable.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Expired Items Report</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procured Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MatTag</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.expiredItemsTable.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.procuredDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.branchName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.modelName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.color}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.matTag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
