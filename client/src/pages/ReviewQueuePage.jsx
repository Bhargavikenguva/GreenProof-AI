import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import ReviewModal from '../components/ReviewModal';
import { UserCheck, ExternalLink, RefreshCw, AlertCircle, Clock, ShieldAlert } from 'lucide-react';

export function ReviewQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal review state
  const [activeReviewId, setActiveReviewId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/reviews/queue');
      setQueue(res.data.queue || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch reviewer queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const openReviewModal = (assessmentId) => {
    setActiveReviewId(assessmentId);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-1">
            <UserCheck className="w-3.5 h-3.5" />
            Specialist Auditor Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
            Human Review Queue
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
            Assessments flagged with material ambiguity, contested evidence, or user review requests
          </p>
        </div>

        <button
          onClick={fetchQueue}
          disabled={loading}
          className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-charcoal-600 transition-colors self-start sm:self-auto"
          title="Refresh Queue"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-sage-200 subtle-shadow overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-charcoal-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-forest-600" />
            <span>Loading reviewer queue...</span>
          </div>
        ) : queue.length === 0 ? (
          <div className="py-16 text-center text-xs text-charcoal-500 space-y-2">
            <ShieldAlert className="w-8 h-8 text-charcoal-300 mx-auto" />
            <p className="font-semibold text-charcoal-700">The human review queue is currently clear.</p>
            <p className="text-[11px] text-charcoal-400">
              No audits currently require manual specialist determination.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-indigo-50/50 border-b border-indigo-100 text-charcoal-700 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Product & Submitter</th>
                  <th className="py-3 px-4">Investigated Claim</th>
                  <th className="py-3 px-4">Status / Trigger</th>
                  <th className="py-3 px-4">User Notes / Reason</th>
                  <th className="py-3 px-4">Queued Date</th>
                  <th className="py-3 px-4 text-right">Auditor Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-charcoal-700">
                {queue.map((item) => (
                  <tr key={item._id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-charcoal-900">
                      <div>{item.productName}</div>
                      <div className="text-[11px] text-charcoal-400 font-normal">
                        {item.companyName} · by {item.user?.name || 'User'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate" title={item.selectedClaim?.claimText}>
                      {item.selectedClaim?.claimText || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-charcoal-500 text-[11px]">
                      {item.reviewRequest?.reason || 'System status: Needs human review'}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-500">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/assessments/${item._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-forest-600 text-charcoal-700 font-medium transition-colors"
                      >
                        <span>Audit</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => openReviewModal(item._id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-medium transition-colors"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Decide</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {activeReviewId && (
        <ReviewModal
          assessmentId={activeReviewId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setActiveReviewId(null);
          }}
          onReviewSubmitted={() => fetchQueue()}
        />
      )}
    </div>
  );
}

export default ReviewQueuePage;
