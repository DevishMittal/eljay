'use client';

import { 
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { OperationsData } from '@/services/superAdminDashboardService';

interface OperationsProps {
  data: OperationsData;
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

export default function Operations({ data }: OperationsProps) {
  // Use actual data from API response
  const referralVolumeData = data.referralVolumeByBranch || [];
  const referralRevenueData = data.referralRevenueByBranch || [];
  const bdmPerformanceData = data.bdmPortfolio.revenuePerformanceVsTargets || [];
  const branchEfficiencyData = data.branchEfficiencyComparison || [];
  const keyEfficiencyInsights = data.keyEfficiencyInsights || [];

  return (
    <div className="space-y-6">
      {/* Top Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Performance</h3>
              <p className="text-sm text-gray-600">Monthly growth and revenue breakdown</p>
            </div>
            <div className="text-2xl">₹</div>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {formatCurrency(data.headerCards.revenuePerformance.amount)}
          </div>
          <div className="text-sm text-green-600 mb-1">
            +{formatPercentage(data.headerCards.revenuePerformance.monthlyGrowthPct)} monthly growth
          </div>
          <div className="text-sm text-gray-600">
            Hearing Aid Sales ({formatPercentage(data.headerCards.revenuePerformance.haSharePct)} of total revenue)
          </div>
        </div>

        {/* Total Active Patients */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Active Patients</h3>
              <p className="text-sm text-gray-600">Patients with visits in a period</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {formatNumber(data.headerCards.totalActivePatients.count)}
          </div>
          <div className="text-sm text-green-600 mb-1">
            +{formatPercentage(data.headerCards.totalActivePatients.growthPct)} this month
          </div>
          <div className="text-sm text-gray-600">
            Patients with visits in a period
          </div>
        </div>

        {/* Invoice Collection Rate */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Invoice Collection Rate</h3>
              <p className="text-sm text-gray-600">Paid invoices vs total invoices</p>
            </div>
            <div className="text-2xl">🔄</div>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {formatPercentage(data.headerCards.invoiceCollectionRate.ratePct)}
          </div>
          <div className="text-sm text-green-600 mb-1">
            +{formatPercentage(data.headerCards.invoiceCollectionRate.improvementPct)} improvement
          </div>
          <div className="text-sm text-gray-600">
            Paid invoices vs total invoices
          </div>
        </div>
      </div>

      {/* Resource Utilization Heatmap - Only show if data is available */}
      {data.resourceUtilization && data.resourceUtilization.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Resource Utilization Heatmap</h3>
          <p className="text-sm text-gray-600 mb-4">Daily utilization rates across all branches</p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-gray-500 py-2">Branch</th>
                  <th className="text-center text-sm font-medium text-gray-500 py-2">MON</th>
                  <th className="text-center text-sm font-medium text-gray-500 py-2">TUE</th>
                  <th className="text-center text-sm font-medium text-gray-500 py-2">WED</th>
                  <th className="text-center text-sm font-medium text-gray-500 py-2">THU</th>
                  <th className="text-center text-sm font-medium text-gray-500 py-2">FRI</th>
                  <th className="text-center text-sm font-medium text-gray-500 py-2">SAT</th>
                </tr>
              </thead>
              <tbody>
                {data.resourceUtilization.map((branch, index) => (
                  <tr key={index}>
                    <td className="text-sm font-medium text-gray-900 py-2">{branch.branch}</td>
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => (
                      <td key={day} className="text-center py-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          branch[day] >= 90 ? 'bg-green-100 text-green-800' :
                          branch[day] >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {branch[day]}%
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-100 rounded mr-2"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-100 rounded mr-2"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
              <span>High</span>
            </div>
          </div>
        </div>
      )}

      {/* Branch Performance Ranking Dashboard - Only show if data is available */}
      {data.branchPerformanceRanking && data.branchPerformanceRanking.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Branch Performance Ranking Dashboard</h3>
          <p className="text-sm text-gray-600 mb-4">Comprehensive scoring matrix with traffic light system</p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-gray-500 py-2">Branch</th>
                  <th className="text-center text-sm font-medium text-gray-500 py-2">Rev</th>
                  <th className="text-center text-sm font-medium text-gray-500 py-2">Growth</th>
                  <th className="text-center text-sm font-medium text-gray-500 py-2">Util</th>
                  <th className="text-center text-sm font-medium text-gray-500 py-2">Sat</th>
                  <th className="text-center text-sm font-medium text-gray-500 py-2">Score</th>
                  <th className="text-center text-sm font-medium text-gray-500 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.branchPerformanceRanking.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="text-sm font-medium text-gray-900 py-2">{item.branch}</td>
                    <td className="text-center text-sm text-gray-900 py-2">{item.rev}%</td>
                    <td className="text-center text-sm text-gray-900 py-2">{item.growth}%</td>
                    <td className="text-center text-sm text-gray-900 py-2">{item.util}%</td>
                    <td className="text-center text-sm text-gray-900 py-2">{item.sat}%</td>
                    <td className="text-center text-sm text-gray-900 py-2">{item.score}</td>
                    <td className="text-center py-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'EXC' ? 'bg-green-100 text-green-800' :
                        item.status === 'GOOD' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'AVG' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status} {item.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Branch Efficiency Comparison - Only show if data is available */}
      {branchEfficiencyData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Branch Efficiency Comparison</h3>
          <p className="text-sm text-gray-600 mb-4">Multi-dimensional performance analysis to identify best practices</p>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={branchEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Main" fill="#3b82f6" name="Main Branch" />
                <Bar dataKey="East" fill="#10b981" name="East Wing" />
                <Bar dataKey="Central" fill="#8b5cf6" name="Central Plaza" />
                <Bar dataKey="North" fill="#f59e0b" name="North Side" />
                <Bar dataKey="South" fill="#ef4444" name="South Side" />
                <Bar dataKey="West" fill="#06b6d4" name="West End" />
                <Bar dataKey="Tech" fill="#84cc16" name="Tech Park" />
                <Bar dataKey="Mall" fill="#f97316" name="Mall Branch" />
                <Bar dataKey="Suburb" fill="#ec4899" name="Suburb Center" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Key Efficiency Insights - Only show if data is available */}
      {keyEfficiencyInsights.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Efficiency Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keyEfficiencyInsights.map((insight, index) => (
              <div key={index} className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">{insight.branch}</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Top Metric: {insight.topMetric} • Score: {formatPercentage(insight.score)}
                </p>
                <div className="text-sm text-blue-600">
                  Focus Area: {insight.focusArea} ⭐ {insight.rating}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Referral Analysis - Branch Performance */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Doctor Referral Analysis - Branch Performance</h3>
        
        {/* Header Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(data.topCards.totals.diagnosticReferrals)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Diagnostic Referrals</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(data.topCards.totals.hearingAidReferrals)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Hearing Aid Referrals</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(data.topCards.totals.totalReferrals)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Referrals</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(data.topCards.totals.diagnosticRevenue)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Diagnostic Revenue</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {formatCurrency(data.topCards.totals.hearingAidRevenue)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Hearing Aid Revenue</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(data.topCards.totals.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Revenue</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referral Volume by Branch */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Referral Volume by Branch</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={referralVolumeData}>
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
                    name === 'diagnostics' ? 'Diagnostics' : 'Hearing Aid'
                  ]}
                />
                <Legend />
                <Bar dataKey="diagnostics" fill={COLORS.primary} name="Diagnostics" />
                <Bar dataKey="hearingAid" fill={COLORS.secondary} name="Hearing Aid" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Referral Revenue by Branch */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Referral Revenue by Branch</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={referralRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="branch" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 100000).toFixed(1)}L`}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'diagnostics' ? 'Diagnostics' : 'Hearing Aid'
                  ]}
                />
                <Legend />
                <Bar dataKey="diagnostics" fill={COLORS.primary} name="Diagnostics" />
                <Bar dataKey="hearingAid" fill={COLORS.secondary} name="Hearing Aid" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Branch Performance Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-medium text-gray-900">Detailed Branch Performance - Doctor Referrals</h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diag. Vol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HA Vol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Ref</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diag. Rev</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HA Rev</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Rev</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Doctor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.detailedBranchPerformance.map((branch, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {branch.branch}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(branch.diagVol)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(branch.haVol)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(branch.totalRef)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(branch.diagRev)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(branch.haRev)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(branch.totalRev)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(branch.conversionRate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {branch.topDoctor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BDM Portfolio Performance Analysis */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">BDM Portfolio Performance Analysis</h3>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(data.bdmPortfolio.summary.activeBDMs)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Active BDMs</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.bdmPortfolio.summary.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Revenue</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(data.bdmPortfolio.summary.avgAchievement)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Avg Achievement</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatNumber(data.bdmPortfolio.summary.doctorsManaged)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Doctors Managed</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {formatNumber(data.bdmPortfolio.summary.newAcquisitions)}
              </div>
              <div className="text-sm text-gray-600 mt-1">New Acquisitions</div>
            </div>
          </div>
        </div>

        {/* BDM Revenue Performance vs Targets */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-medium text-gray-900 mb-4">BDM Revenue Performance vs Targets</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={bdmPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 100000).toFixed(1)}L`}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'actual' ? 'Actual' : 'Target'
                ]}
              />
              <Legend />
              <Bar dataKey="actual" fill={COLORS.primary} name="Actual" />
              <Bar dataKey="target" fill={COLORS.warning} name="Target" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* BDM Portfolio Analysis Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-medium text-gray-900">BDM Portfolio Analysis</h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BDM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branches</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hearing Aid Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contribution %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctors</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Acq</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg/Doctor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.bdmPortfolio.table.rows.map((bdm, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bdm.bdm}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(bdm.branches)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(bdm.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(bdm.hearingAidRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        (bdm.contributionPct || 0) >= 95 ? 'bg-green-100 text-green-800' :
                        (bdm.contributionPct || 0) >= 90 ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {formatPercentage(bdm.contributionPct || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(bdm.doctors)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      +{formatNumber(bdm.newAcq)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(bdm.avgPerDoctor)}
                    </td>
                  </tr>
                ))}
                
                {/* Network Total Row */}
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    Network Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatNumber(data.bdmPortfolio.table.networkTotal.branches)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(data.bdmPortfolio.table.networkTotal.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(data.bdmPortfolio.table.networkTotal.hearingAidRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                      {formatPercentage(data.bdmPortfolio.table.networkTotal.contributionPct)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatNumber(data.bdmPortfolio.table.networkTotal.doctors)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    +{formatNumber(data.bdmPortfolio.table.networkTotal.newAcq)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(data.bdmPortfolio.table.networkTotal.avgPerDoctor)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
