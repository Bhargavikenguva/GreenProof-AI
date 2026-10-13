import React, { useState } from 'react';
import { X, Send, UserCheck, AlertCircle } from 'lucide-react';
import api from '../api/client';

export function ReviewModal({ assessmentId, isOpen, onClose, onReviewSubmitted }) {
  const [decision, setDecision] = useState('Approved');
  const [notes, setNotes] = useState('');
  const [requestedEvidence, setRequestedEvidence] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Review notes are required to substantiate the auditor determination.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const requestedList = requestedEvidence
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.post(`/reviews/${assessmentId}/decision`, {
        decision,
        notes: notes.trim(),
        requestedAdditionalEvidence: requestedList,
      });

      onReviewSubmitted(res.data.review);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review decision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-mint-50/50">
          <div className="flex items-center gap-2 text-forest-800">
            <UserCheck className="w-5 h-5 text-forest-700" />
            <h3 className="font-semibold text-base">Record Specialist Review Decision</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 uppercase tracking-wider">
              Auditor Determination
            </label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
            >
              <option value="Approved">Approved (Claim technically substantiated)</option>
              <option value="Rejected">Rejected (Inconsistent or unverified claim)</option>
              <option value="Clarification Requested">Clarification Requested (More data needed)</option>
              <option value="Needs Specialist Testing">Needs Specialist Testing (Physical lab assay required)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 uppercase tracking-wider">
              Specialist Reviewer Notes *
            </label>
            <textarea
              rows={4}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail your scientific or regulatory findings regarding scope, test standards, and traceability..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 uppercase tracking-wider">
              Requested Additional Evidence (Optional, 1 per line)
            </label>
            <textarea
              rows={2}
              value={requestedEvidence}
              onChange={(e) => setRequestedEvidence(e.target.value)}
              placeholder="e.g. Current ISO 14021 conformity statement&#10;Supply chain chain-of-custody cert"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-charcoal-600 hover:bg-gray-50 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Save Decision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
