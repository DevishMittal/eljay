'use client';

import { 
  BarChart, Bar, 
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
  const diagnosticsChartData = (data.diagnosticsRevenueByCentre || []).map(item => ({
    branch: item.branch,
    BERA: item.hearing, // Using hearing for BERA as per doc
    OAE: item.pediatric,
    PTA: item.hearing * 0.6, // Estimated split
    Tinnitus: item.vertigo,
  }));

  // Transform market share data for pie chart
  const marketShareData = (data.marketShare || []).map(item => ({
    name: item.brand,
    value: item.percentage,
    fill: BRAND_COLORS[item.brand as keyof typeof BRAND_COLORS] || COLORS.primary
  }));

  // Transform profitability analysis data
  const profitabilityData = (data.profitabilityAnalysis || []).map(item => ({
    brand: item.brand,
    profitability: item.profitability
  }));

  // Transform branch preferences by brand data
  const branchPreferencesData = (data.branchPreferencesByBrand || []).reduce((acc, item) => {
    const existing = acc.find(branch => branch.branch === item.branch);
    if (existing) {
      (existing as Record<string, string | number>)[item.brand] = item.count;
    } else {
      acc.push({
        branch: item.branch,
        [item.brand]: item.count,
        ...Object.keys(BRAND_COLORS).reduce((obj, brand) => {
          obj[brand] = 0;
          return obj;
        }, {} as Record<string, number>)
      });
    }
    return acc;
  }, [] as Array<Record<string, string | number>>);

  return (
    <div className="space-y-6">
      {/* Top Row - Revenue Overviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hearing Aid Revenue by Centre - Only show if data is available */}
        {(data.hearingAidRevenueByCentre || []).length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hearing Aid Revenue by Centre (Performance vs targets)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.hearingAidRevenueByCentre}>
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
                  formatter={(value: number) => [
                    formatCurrency(value),
                    'Revenue'
                  ]}
                />
                <Bar dataKey="revenue" fill={COLORS.primary} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Diagnostics Revenue by Centre - Only show if data is available */}
        {(data.diagnosticsRevenueByCentre || []).length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Diagnostics Revenue by Centre (Breakdown by test type)</h3>
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
        )}
      </div>

      {/* Middle Section - Hearing Aid Sales Analysis - Branch Performance */}
      <div className="space-y-6">
        {/* Key Metrics Cards */}
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

        {/* Hearing Aid Volume and Revenue Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hearing Aid Volume by Branch - Only show if data is available */}
          {(data.hearingAidVolumeByBranch || []).length > 0 && (
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
                  <Bar dataKey="volume" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Hearing Aid Revenue by Branch - Only show if data is available */}
          {(data.hearingAidRevenueByBranch || []).length > 0 && (
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
                  <Bar dataKey="revenue" fill={COLORS.secondary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Audiologist Performance Analysis - Only show if data is available */}
        {(data.audiologistPerformance || []).length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Audiologist Performance Analysis</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Audiologist Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Sale Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(data.audiologistPerformance || []).map((audiologist, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {audiologist.audiologistName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {audiologist.branch}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(audiologist.unitsSold)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(audiologist.revenueGenerated)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(audiologist.avgSaleValue)}
                      </td>
                    </tr>
                  ))}
                  {/* Network Total Row */}
                  <tr className="bg-gray-50 font-medium">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Network Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(data.audiologistPerformance || []).length} Audiologists
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber((data.audiologistPerformance || []).reduce((sum, a) => sum + a.unitsSold, 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency((data.audiologistPerformance || []).reduce((sum, a) => sum + a.revenueGenerated, 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(
                        (data.audiologistPerformance || []).reduce((sum, a) => sum + a.revenueGenerated, 0) /
                        (data.audiologistPerformance || []).reduce((sum, a) => sum + a.unitsSold, 0) || 0
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section - Hearing Aid Sales by Brand */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Share - Only show if data is available */}
          {(data.marketShare || []).length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Market Share</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={marketShareData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value ? `${name}: ${value.toFixed(1)}%` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {marketShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Market Share']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Profitability Analysis - Only show if data is available */}
          {(data.profitabilityAnalysis || []).length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profitability Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profitabilityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="brand" 
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
                    formatter={(value: number) => [formatCurrency(value), 'Profitability']}
                  />
                  <Bar dataKey="profitability" fill={COLORS.accent} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Branch Preferences by Brand - Only show if data is available */}
          {(data.branchPreferencesByBrand || []).length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Branch Preferences by Brand</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={branchPreferencesData}>
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
                    formatter={(value: number, name: string) => [formatNumber(value), name]}
                  />
                  <Legend />
                  {Object.keys(BRAND_COLORS).map(brand => (
                    <Bar 
                      key={brand}
                      dataKey={brand} 
                      stackId="a" 
                      fill={BRAND_COLORS[brand as keyof typeof BRAND_COLORS]} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}