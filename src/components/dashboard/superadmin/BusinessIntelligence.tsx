'use client';

import { 
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BusinessIntelligenceData } from '@/services/superAdminDashboardService';

interface BusinessIntelligenceProps {
  data: BusinessIntelligenceData;
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
  hearing: '#3b82f6', // Blue for hearing tests
  pediatric: '#10b981', // Green for pediatric tests
  vertigo: '#8b5cf6', // Purple for vertigo tests
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

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export default function BusinessIntelligence({ data }: BusinessIntelligenceProps) {
  // Transform test volume data for charts
  const testVolumeData = data.testVolumeByBranch.length > 0
    ? data.testVolumeByBranch
    : [
        { branch: 'Main', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'North', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'South', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'East', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'Central', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'West', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'Tech', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'Mall', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'Suburb', hearing: 0, pediatric: 0, vertigo: 0 }
      ];

  // Transform test revenue data for charts
  const testRevenueData = data.testRevenueByBranch.length > 0
    ? data.testRevenueByBranch
    : [
        { branch: 'Main', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'North', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'South', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'East', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'Central', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'West', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'Tech', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'Mall', hearing: 0, pediatric: 0, vertigo: 0 },
        { branch: 'Suburb', hearing: 0, pediatric: 0, vertigo: 0 }
      ];

  // Transform diagnostic services data
  const diagnosticServicesData = data.diagnosticServices.length > 0
    ? data.diagnosticServices
    : [
        { service: 'Pure Tone Audiometry', revenue: 0 },
        { service: 'BERA', revenue: 0 },
        { service: 'OAE', revenue: 0 },
        { service: 'Speech Audiometry', revenue: 0 },
        { service: 'ECochG', revenue: 0 },
        { service: 'VEMP', revenue: 0 },
        { service: 'VNG', revenue: 0 },
        { service: 'ASSR', revenue: 0 }
      ];

  // Transform branch distribution data for service analysis
  const branchDistributionData = data.serviceAnalysis.branchDistribution.length > 0
    ? data.serviceAnalysis.branchDistribution
    : [
        { branch: 'Main', revenue: 0 },
        { branch: 'North', revenue: 0 },
        { branch: 'South', revenue: 0 },
        { branch: 'East', revenue: 0 },
        { branch: 'Central', revenue: 0 },
        { branch: 'West', revenue: 0 },
        { branch: 'Tech', revenue: 0 },
        { branch: 'Mall', revenue: 0 },
        { branch: 'Suburb', revenue: 0 }
      ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(data.diagnosticMetrics.hearingTestCount)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Hearing Tests</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(data.diagnosticMetrics.pediatricTestCount)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Pediatric Tests</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(data.diagnosticMetrics.vertigoTestCount)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Vertigo Tests</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(data.diagnosticMetrics.hearingRevenue)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Hearing Revenue</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600">
              {formatCurrency(data.diagnosticMetrics.pediatricRevenue)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Pediatric Revenue</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.diagnosticMetrics.vertigoRevenue)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Vertigo Revenue</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Volume by Branch */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Test Volume by Branch</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={testVolumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="branch" 
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatNumber(value),
                  name === 'hearing' ? 'Hearing Tests' : 
                  name === 'pediatric' ? 'Pediatric Tests' : 'Vertigo Tests'
                ]}
              />
              <Legend />
              <Bar dataKey="hearing" fill={COLORS.hearing} name="Hearing Tests" />
              <Bar dataKey="pediatric" fill={COLORS.pediatric} name="Pediatric Tests" />
              <Bar dataKey="vertigo" fill={COLORS.vertigo} name="Vertigo Tests" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Test Revenue by Branch */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Test Revenue by Branch</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={testRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="branch" 
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 100000).toFixed(1)}L`}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'hearing' ? 'Hearing Revenue' : 
                  name === 'pediatric' ? 'Pediatric Revenue' : 'Vertigo Revenue'
                ]}
              />
              <Legend />
              <Bar dataKey="hearing" fill={COLORS.hearing} name="Hearing Revenue" />
              <Bar dataKey="pediatric" fill={COLORS.pediatric} name="Pediatric Revenue" />
              <Bar dataKey="vertigo" fill={COLORS.vertigo} name="Vertigo Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Branch Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Detailed Branch Performance - Diagnostic Tests</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hearing Vol.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pediatric Vol.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vertigo Vol.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hearing Rev.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pediatric Rev.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vertigo Rev.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.branchPerformance.map((branch, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {branch.branch}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(branch.hearingVol)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(branch.pediatricVol)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(branch.vertigoVol)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(branch.hearingRev)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(branch.pediatricRev)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(branch.vertigoRev)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(branch.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Diagnostic Services by Revenue */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-medium text-gray-900 mb-2">All Diagnostic Services by Revenue</h4>
        <p className="text-sm text-gray-600 mb-4">Revenue contribution and performance metrics across all diagnostic services.</p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={diagnosticServicesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="service" 
              angle={-45}
              textAnchor="end"
              height={120}
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => `${(value / 100000).toFixed(1)}L`}
              fontSize={12}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
            />
            <Bar dataKey="revenue" fill={COLORS.primary} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Branch-wise Service Revenue Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-medium text-gray-900 mb-2">Branch-wise Service Revenue Distribution</h4>
        <p className="text-sm text-gray-600 mb-4">Revenue contribution by branch organized by service categories</p>
        
        <div className="mb-6">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>Select Diagnostic Service</option>
            <option value="ECochG">ECochG</option>
            <option value="BERA">BERA</option>
            <option value="OAE">OAE</option>
            <option value="VNG">VNG</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900">{data.serviceAnalysis.serviceName}</h5>
            <p className="text-sm text-blue-700">
              {formatNumber(data.serviceAnalysis.totalRevenue)} services • Avg Price: ₹5,000 • Total Revenue: {formatCurrency(data.serviceAnalysis.totalRevenue)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-medium text-green-900">Service Performance</h5>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.serviceAnalysis.totalRevenue)}
            </div>
            <div className="text-sm text-green-700">
              {data.serviceAnalysis.monthlyGrowth > 0 ? '+' : ''}{formatPercentage(data.serviceAnalysis.monthlyGrowth)} monthly growth
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="font-medium text-purple-900">Monthly Growth</h5>
            <div className="text-2xl font-bold text-purple-600">
              {data.serviceAnalysis.monthlyGrowth > 0 ? '+' : ''}{formatPercentage(data.serviceAnalysis.monthlyGrowth)}
            </div>
            <div className="text-sm text-purple-700">monthly growth</div>
          </div>
        </div>

        <div>
          <h5 className="text-lg font-medium text-gray-900 mb-2">Branch-wise Revenue Distribution</h5>
          <p className="text-sm text-gray-600 mb-4">Revenue breakdown across all branches for {data.serviceAnalysis.serviceName}</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="branch" 
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              />
              <Bar dataKey="revenue" fill={COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(data.businessMetrics.totalActivePatients)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Active Patients</div>
            <div className="text-xs text-green-600 mt-1">+12.5% from last month</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.businessMetrics.averageTransactionValue)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Average Transaction Value</div>
            <div className="text-xs text-green-600 mt-1">+8.3% from last month</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatPercentage(data.businessMetrics.patientRetentionRate)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Patient Retention Rate</div>
            <div className="text-xs text-red-600 mt-1">-2.1% from last month</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatPercentage(data.businessMetrics.invoiceCollectionRate)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Invoice Collection Rate</div>
            <div className="text-xs text-green-600 mt-1">+1.8% from last month</div>
          </div>
        </div>
      </div>
    </div>
  );
}