/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { patientTransferService, BranchOption } from '@/services/patientTransferService';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onTransferred?: () => void;
};

export default function PatientTransferModal({ isOpen, onClose, patientId, onTransferred }: Props) {
  const { token } = useAuth();
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!isOpen || !patientId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await patientTransferService.getAvailableBranches(patientId, token || undefined);
        setBranches(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load branches');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [isOpen, patientId, token]);

  const canSubmit = useMemo(() => !!selectedBranchId && !submitting, [selectedBranchId, submitting]);

  const handleTransfer = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await patientTransferService.transferPatient({ patientId, toBranchId: selectedBranchId, reason }, token || undefined);
      onTransferred?.();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to transfer patient');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg border">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-sm font-semibold text-gray-900">Transfer Patient</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Target Branch</label>
            <select
              className="w-full px-3 py-2 text-xs rounded-lg border bg-white"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              disabled={loading}
            >
              <option value="">{loading ? 'Loading branches...' : 'Select a branch'}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}{b.address ? ` — ${b.address}` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Reason (optional)</label>
            <textarea
              className="w-full px-3 py-2 text-xs rounded-lg border bg-white"
              rows={3}
              placeholder="Add a brief reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t">
          <button onClick={onClose} className="px-4 py-1.5 text-xs border rounded-lg">Cancel</button>
          <button
            onClick={handleTransfer}
            disabled={!canSubmit}
            className="px-4 py-1.5 text-xs rounded-lg text-white bg-orange-600 disabled:opacity-50"
          >
            {submitting ? 'Transferring...' : 'Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
}


