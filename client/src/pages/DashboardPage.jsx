import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  FileText,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/stats/dashboard');
      setStats(res.data.stats);
      setRecentAssessments(res.data.recentAssessments || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
            Welcome back, {user?.name || 'Auditor'}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Real-time environmental claim audits and verification telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-charcoal-600 transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/assessments/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Analyze New Product
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row - Real MongoDB Data */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Assessments */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sage-200 subtle-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Total Audits</span>
            <FileText className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-charcoal-900">
            {loading ? '...' : stats?.totalAssessments ?? 0}
          </div>
          <span className="text-[11px] text-charcoal-400 mt-1 block">Saved in database</span>
        </div>

        {/* Supported by available evidence */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 subtle-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Supported</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-900">
            {loading ? '...' : stats?.statusCounts?.supported ?? 0}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Substantiated by evidence</span>
        </div>

        {/* Insufficient evidence */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 subtle-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Insufficient</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-900">
            {loading ? '...' : stats?.statusCounts?.insufficient ?? 0}
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">Incomplete documentation</span>
        </div>

        {/* Potential inconsistency */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-200 subtle-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Inconsistent</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-900">
            {loading ? '...' : stats?.statusCounts?.inconsistency ?? 0}
          </div>
          <span className="text-[11px] text-rose-700 mt-1 block">Material contradiction</span>
        </div>

        {/* Needs human review */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-200 subtle-shadow col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">Human Review</span>
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-900">
            {loading ? '...' : stats?.statusCounts?.needsReview ?? 0}
          </div>
          <span className="text-[11px] text-indigo-700 mt-1 block">Specialist queue</span>
        </div>
      </div>

      {/* Recent Assessments Table */}
      <div className="bg-white rounded-2xl border border-sage-200 subtle-shadow overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-charcoal-900">Recent Environmental Claim Assessments</h2>
            <p className="text-xs text-charcoal-500">Live assessments query from your MongoDB repository</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-forest-700 hover:text-forest-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-charcoal-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-forest-600" />
            <span>Loading records from MongoDB...</span>
          </div>
        ) : recentAssessments.length === 0 ? (
          <div className="py-12 text-center text-xs text-charcoal-500 space-y-3">
            <p>No product assessments recorded yet.</p>
            <Link
              to="/assessments/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-700 text-white font-medium text-xs hover:bg-forest-800"
            >
              <PlusCircle className="w-4 h-4" />
              Start Your First Assessment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sage-50/70 border-b border-sage-100 text-charcoal-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Product & Company</th>
                  <th className="py-3 px-4">Investigated Claim</th>
                  <th className="py-3 px-4">Audit Status</th>
                  <th className="py-3 px-4">Evidence Docs</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-charcoal-700">
                {recentAssessments.map((item) => (
                  <tr key={item._id} className="hover:bg-mint-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-charcoal-900">
                      <div>{item.productName}</div>
                      <div className="text-[11px] text-charcoal-400 font-normal">{item.companyName}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate" title={item.selectedClaim?.claimText || 'None selected'}>
                      {item.selectedClaim?.claimText || (
                        <span className="text-charcoal-400 italic">No claim selected</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-500">
                      {item.evidenceDocuments?.length || 0} document(s)
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/assessments/${item._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-forest-600 hover:text-forest-700 font-medium transition-colors"
                      >
                        <span>View Report</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
