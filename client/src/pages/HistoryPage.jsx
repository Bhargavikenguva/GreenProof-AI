import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { Search, Filter, Calendar, ExternalLink, RefreshCw, FileText, PlusCircle } from 'lucide-react';

export function HistoryPage() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/assessments');
      setAssessments(res.data.assessments || []);
    } catch (err) {
      setError(err.message || 'Failed to load assessment history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = assessments.filter((item) => {
    const matchesSearch =
      (item.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.selectedClaim?.claimText || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
            Assessment History & Records
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Complete historical log of packaging audits and verification results
          </p>
        </div>

        <Link
          to="/assessments/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Assessment</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-sage-200 subtle-shadow flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product, company, or packaging claim..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-charcoal-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs bg-white text-charcoal-700"
          >
            <option value="ALL">All Status Labels</option>
            <option value="Supported by available evidence">Supported by available evidence</option>
            <option value="Insufficient evidence">Insufficient evidence</option>
            <option value="Potential inconsistency">Potential inconsistency</option>
            <option value="Needs human review">Needs human review</option>
            <option value="Claims Detected">In Progress</option>
          </select>
        </div>
      </div>

      {/* Table or Cards */}
      <div className="bg-white rounded-2xl border border-sage-200 subtle-shadow overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-charcoal-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-forest-600" />
            <span>Loading historical audits...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-charcoal-500 space-y-2">
            <FileText className="w-8 h-8 text-charcoal-300 mx-auto" />
            <p>No assessments matching your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sage-50/70 border-b border-sage-100 text-charcoal-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Product & Company</th>
                  <th className="py-3 px-4">Investigated Claim</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Evidence</th>
                  <th className="py-3 px-4">Audit Date</th>
                  <th className="py-3 px-4 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-charcoal-700">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-mint-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-charcoal-900">
                      <div>{item.productName}</div>
                      <div className="text-[11px] text-charcoal-400 font-normal">{item.companyName}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm truncate" title={item.selectedClaim?.claimText}>
                      {item.selectedClaim?.claimText || <span className="text-charcoal-400 italic">None</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-500">
                      {item.evidenceDocuments?.length || 0} doc(s)
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/assessments/${item._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-forest-600 hover:text-forest-700 font-medium transition-colors"
                      >
                        <span>View</span>
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

export default HistoryPage;
