/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { useSearchParams, useParams } from 'next/navigation';
import { referralService } from '@/services/referralService';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/commissionUtils';

type StatementRow = {
  doctor: string;
  period: string;
  referrals: number;
  revenue: number;
  commission: number;
  status: 'draft' | 'sent' | 'paid';
  dueDate: string;
};

export default function DoctorCommissionStatementPage() {
  const { token } = useAuth();
  const params = useParams();
  const search = useSearchParams();
  const doctorFromQuery = search.get('doctor') || '';
  const periodFromQuery = search.get('period') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statement, setStatement] = useState<StatementRow | null>(null);

  const periodParam = useMemo(() => {
    // Expect period like 'December 2024' -> convert to YYYY-MM for API if needed.
    // Backend accepts optional period=YYYY-MM; if not provided, current month is used.
    // If UI supplies "December 2024", keep it only for display; we won't constrain API.
    return undefined as string | undefined;
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await referralService.getDoctorCommissionStatements(
          periodParam ? { period: periodParam } : {},
          token
        );

        const rows: StatementRow[] = res.data || [];
        const match = rows.find(
          (r) =>
            r.doctor?.toLowerCase() === doctorFromQuery.toLowerCase() &&
            (periodFromQuery ? r.period === periodFromQuery : true)
        );
        if (!match) {
          setError('Statement not found for the selected doctor/period.');
        }
        setStatement(match || null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load statement');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token, doctorFromQuery, periodFromQuery, periodParam]);

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-md font-semibold" style={{ color: '#101828' }}>Referral Status</h1>
            <p className="text-xs" style={{ color: '#717182' }}>Current status of this referral</p>
          </div>
          <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs">
            {statement?.status || '—'}
          </span>
        </div>

        {/* Top summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg border p-3">
            <div className="text-xs" style={{ color: '#717182' }}>Total Items</div>
            <div className="text-sm font-semibold" style={{ color: '#101828' }}>{statement ?  statement.referrals : '—'}</div>
          </div>
          <div className="bg-white rounded-lg border p-3">
            <div className="text-xs" style={{ color: '#717182' }}>Total Amount</div>
            <div className="text-sm font-semibold" style={{ color: '#101828' }}>{statement ? formatCurrency(statement.revenue) : '—'}</div>
          </div>
          <div className="bg-white rounded-lg border p-3">
            <div className="text-xs" style={{ color: '#717182' }}>Commission</div>
            <div className="text-sm font-semibold" style={{ color: '#101828' }}>{statement ? formatCurrency(statement.commission) : '—'}</div>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg border p-3">
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#101828' }}>Patient Information</h3>
            <div className="text-xs" style={{ color: '#717182' }}>Referral Date</div>
            <div className="text-xs" style={{ color: '#101828' }}>{statement?.period || '—'}</div>
          </div>
          <div className="bg-white rounded-lg border p-3">
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#101828' }}>Referring Doctor</h3>
            <div className="text-xs" style={{ color: '#717182' }}>Doctor Name</div>
            <div className="text-xs" style={{ color: '#101828' }}>{statement?.doctor || '—'}</div>
            <div className="mt-2 text-xs" style={{ color: '#717182' }}>Commission Rate</div>
            <div className="text-xs" style={{ color: '#101828' }}>Calculated from backend totals</div>
          </div>
        </div>

        {/* Services table (simple summary from statement since backend does not return line items here) */}
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-3">
            <h3 className="text-sm font-semibold" style={{ color: '#101828' }}>Services & Products</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                  <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-2 text-xs" style={{ color: '#101828' }}>All referred services</td>
                  <td className="px-4 py-2 text-xs"><span className="bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-[10px]">Aggregated</span></td>
                  <td className="px-4 py-2 text-xs" style={{ color: '#101828' }}>{statement ? formatCurrency(statement.revenue) : '—'}</td>
                  <td className="px-4 py-2 text-xs" style={{ color: '#101828' }}>{statement ? formatCurrency(statement.commission) : '—'}</td>
                  <td className="px-4 py-2 text-xs">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      statement?.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : statement?.status === 'sent'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>{statement?.status || '—'}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between text-xs">
            <div style={{ color: '#717182' }}>Total Amount:</div>
            <div className="font-medium" style={{ color: '#101828' }}>{statement ? formatCurrency(statement.revenue) : '—'}</div>
          </div>
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between text-xs">
            <div className="text-green-600">Total Commission:</div>
            <div className="font-medium text-green-600">{statement ? formatCurrency(statement.commission) : '—'}</div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg border p-3">
          <h3 className="text-sm font-semibold mb-2" style={{ color: '#101828' }}>Notes</h3>
          <p className="text-xs" style={{ color: '#717182' }}>
            This statement aggregates revenue and commission for {statement?.doctor || '—'} in {statement?.period || '—'} based on backend data.
          </p>
        </div>

        {loading && (
          <div className="text-center text-xs text-gray-500">Loading...</div>
        )}
        {error && (
          <div className="text-center text-xs text-red-600">{error}</div>
        )}
      </div>
    </MainLayout>
  );
}


