/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { 
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BusinessIntelligenceData } from '@/services/superAdminDashboardService';

interface BusinessIntelligenceProps {
  data: BusinessIntelligenceData;
}

// Color scheme for charts matching the design
const COLORS = {
  hearing: '#3b82f6', // Blue for hearing tests
  pediatric: '#10b981', // Green for pediatric tests
  vertigo: '#8b5cf6', // Purple for vertigo tests
  primary: '#3b82f6', // Blue
  secondary: '#10b981', // Green
  tertiary: '#8b5cf6', // Purple
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
  const [selectedService, setSelectedService] = useState('ECochG');

  // Use actual data from API response
  const testVolumeData = data.testVolumeByBranch || [];
  const testRevenueData = data.testRevenueByBranch || [];
  const diagnosticServicesData = data.diagnosticServices || [];
  const branchDistributionData = data.serviceAnalysis.branchDistribution || [];
  const branchPerformanceData = data.branchPerformance || [];

  // Calculate total volumes for summary cards
  const totalHearingVolume = testVolumeData.reduce((sum, item) => sum + item.hearing, 0);
  const totalPediatricVolume = testVolumeData.reduce((sum, item) => sum + item.pediatric, 0);
  const totalVertigoVolume = testVolumeData.reduce((sum, item) => sum + item.vertigo, 0);

  // Calculate total revenues for summary cards
  const totalHearingRevenue = testRevenueData.reduce((sum, item) => sum + item.hearing, 0);
  const totalPediatricRevenue = testRevenueData.reduce((sum, item) => sum + item.pediatric, 0);
  const totalVertigoRevenue = testRevenueData.reduce((sum, item) => sum + item.vertigo, 0);

  return (
    <div className="space-y-6">
      {/* Top-Level Diagnostic Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(totalHearingVolume)} Total volume
            </div>
            <div className="text-sm text-gray-600 mt-1">Hearing Tests</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(totalPediatricVolume)} Total volume
            </div>
            <div className="text-sm text-gray-600 mt-1">Pediatric Tests</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(totalVertigoVolume)} Total volume
            </div>
            <div className="text-sm text-gray-600 mt-1">Vertigo Tests</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalHearingRevenue)} Total earnings
            </div>
            <div className="text-sm text-gray-600 mt-1">Hearing Revenue</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPediatricRevenue)} Total earnings
            </div>
            <div className="text-sm text-gray-600 mt-1">Pediatric Revenue</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalVertigoRevenue)} Total earnings
            </div>
            <div className="text-sm text-gray-600 mt-1">Vertigo Revenue</div>
          </div>
        </div>
      </div>

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
            <YAxis 
              domain={[0, 800]}
              tickCount={5}
              fontSize={12} 
            />
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
              domain={[0, 2600000]}
              tickCount={5}
              tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
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
              {branchPerformanceData.map((branch, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {branch.branch}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(branch.hearingVolume)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(branch.pediatricVolume)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(branch.vertigoVolume)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(branch.hearingRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(branch.pediatricRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(branch.vertigoRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(branch.totalRevenue)}
                  </td>
                </tr>
              ))}
              {/* Network Total Row */}
              <tr className="bg-gray-100 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Network Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(branchPerformanceData.reduce((sum, branch) => sum + branch.hearingVolume, 0))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(branchPerformanceData.reduce((sum, branch) => sum + branch.pediatricVolume, 0))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(branchPerformanceData.reduce((sum, branch) => sum + branch.vertigoVolume, 0))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(branchPerformanceData.reduce((sum, branch) => sum + branch.hearingRevenue, 0))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(branchPerformanceData.reduce((sum, branch) => sum + branch.pediatricRevenue, 0))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(branchPerformanceData.reduce((sum, branch) => sum + branch.vertigoRevenue, 0))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(branchPerformanceData.reduce((sum, branch) => sum + branch.totalRevenue, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* All Diagnostic Services by Revenue */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-medium text-gray-900 mb-2">All Diagnostic Services by Revenue</h4>
        <p className="text-sm text-gray-600 mb-4">Revenue contribution and performance metrics across all diagnostic services</p>
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
              domain={[0, 3000000]}
              tickCount={5}
              tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
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
          <label htmlFor="service-selector" className="block text-sm font-medium text-gray-700 mb-2">
            Select Diagnostic Service
          </label>
          <select 
            id="service-selector"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ECochG">ECochG</option>
            <option value="BERA">BERA</option>
            <option value="OAE">OAE</option>
            <option value="VNG">VNG</option>
            <option value="Pure Tone Audiometry">Pure Tone Audiometry</option>
            <option value="Speech Audiometry">Speech Audiometry</option>
            <option value="VEMP">VEMP</option>
            <option value="ASSR">ASSR</option>
          </select>
          <div className="mt-2 text-sm text-gray-600">
            {selectedService} {branchDistributionData.reduce((sum, item) => sum + item.revenue, 0) / 1000} vol • {formatCurrency(branchDistributionData.reduce((sum, item) => sum + item.revenue, 0))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900">Service Performance</h5>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.serviceAnalysis.totalRevenue)}
            </div>
            <div className="text-sm text-blue-700">
              Monthly Growth {data.serviceAnalysis.monthlyGrowth > 0 ? '+' : ''}{formatPercentage(data.serviceAnalysis.monthlyGrowth)}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-medium text-green-900">{selectedService} Details</h5>
            <p className="text-sm text-green-700">
              {branchDistributionData.reduce((sum, item) => sum + item.revenue, 0) / 1000} services • Avg Price: ₹5,000 • Total Revenue: {formatCurrency(branchDistributionData.reduce((sum, item) => sum + item.revenue, 0))}
            </p>
          </div>
        </div>

        <div>
          <h5 className="text-lg font-medium text-gray-900 mb-2">Revenue breakdown across all branches for {selectedService}</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="branch" 
                fontSize={12}
              />
              <YAxis 
                domain={[0, 100000]}
                tickCount={5}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  formatCurrency(value), 
                  'Revenue',
                  `#${branchDistributionData.indexOf(props.payload) + 1} ${props.payload.branch} ${((value / branchDistributionData.reduce((sum, item) => sum + item.revenue, 0)) * 100).toFixed(1)}% of total`
                ]}
              />
              <Bar dataKey="revenue" fill={COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom-Level Business Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(data.businessMetrics.totalActivePatients)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Active Patients</div>
            <div className="text-xs text-green-600 mt-1">+12.5% from last month.</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.businessMetrics.averageTransactionValue)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Average Transaction Value</div>
            <div className="text-xs text-green-600 mt-1">+8.3% from last month.</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatPercentage(data.businessMetrics.patientRetentionRate)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Patient Retention Rate</div>
            <div className="text-xs text-green-600 mt-1">+2.1% from last month.</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatPercentage(data.businessMetrics.invoiceCollectionRate)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Invoice Collection Rate</div>
            <div className="text-xs text-green-600 mt-1">+1.8% from last month.</div>
          </div>
        </div>
      </div>
    </div>
  );
}