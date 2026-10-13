import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ReviewModal from '../components/ReviewModal';
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  ListChecks,
  UserCheck,
  Calendar,
  ExternalLink,
  RefreshCw,
  Building2,
  Package,
  Layers,
  Sparkles,
  Quote,
} from 'lucide-react';

export function ReportPage() {
  const { id } = useParams();
  const { isReviewer } = useAuth();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [requestingReview, setRequestingReview] = useState(false);
  const [reviewRequestedSuccess, setReviewRequestedSuccess] = useState(false);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/assessments/${id}`);
      setAssessment(res.data.assessment);
    } catch (err) {
      setError(err.message || 'Failed to load assessment report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const handleRequestReview = async () => {
    try {
      setRequestingReview(true);
      await api.post(`/assessments/${id}/review-request`, {
        reason: 'User requested specialist auditor verification of evidence citations.',
      });
      setReviewRequestedSuccess(true);
      await fetchAssessment();
    } catch (err) {
      setError(err.message || 'Failed to request human review.');
    } finally {
      setRequestingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center text-xs text-charcoal-500 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-forest-600" />
        <span>Compiling evidence-based assessment report...</span>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error || 'Assessment not found.'}
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-700 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const result = assessment.assessmentResult;
  const hasResult = Boolean(result && result.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-500 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Assessed: {result?.assessedAt ? new Date(result.assessedAt).toLocaleDateString() : 'Draft'}
            </span>
            <span>·</span>
            <span className="font-mono text-[11px] text-charcoal-400">ID: {assessment._id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
            Environmental Claim Assessment Report
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isReviewer ? (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Record Auditor Decision</span>
            </button>
          ) : !assessment.reviewRequest?.requested ? (
            <button
              onClick={handleRequestReview}
              disabled={requestingReview}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-charcoal-700 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>{requestingReview ? 'Queuing...' : 'Request Human Review'}</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
              <UserCheck className="w-3.5 h-3.5" />
              Queued in Specialist Review
            </span>
          )}
        </div>
      </div>

      {/* Product & Photo Overview Card */}
      <div className="bg-white rounded-3xl p-6 border border-sage-200 subtle-shadow grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Packaging Photo */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center min-h-[200px]">
          {assessment.productImage?.path ? (
            <img
              src={
                assessment.productImage.path.startsWith('http')
                  ? assessment.productImage.path
                  : `${import.meta.env.VITE_BACKEND_URL || ''}${assessment.productImage.path}`
              }
              alt={assessment.productName}
              className="w-full h-56 object-contain bg-white"
            />
          ) : (
            <div className="text-center p-4 text-xs text-charcoal-400">
              <Package className="w-8 h-8 mx-auto mb-1 text-charcoal-300" />
              <span>No image file uploaded</span>
            </div>
          )}
        </div>

        {/* Right 2 cols: Product & Claim Context */}
        <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider block">
                  Product Under Investigation
                </span>
                <h2 className="text-xl font-bold text-charcoal-900 mt-0.5">
                  {assessment.productName}
                </h2>
                <p className="text-xs text-charcoal-600 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-charcoal-400" />
                  <span>{assessment.companyName}</span>
                </p>
              </div>

              {hasResult && <StatusBadge status={result.status} size="lg" />}
            </div>

            {/* Investigated Claim Card */}
            <div className="bg-mint-50/70 border border-sage-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider block mb-1">
                Selected Packaging Environmental Claim
              </span>
              <p className="text-sm font-bold text-charcoal-900">
                “{assessment.selectedClaim?.claimText || 'None specified'}”
              </p>
              {assessment.selectedClaim?.originalOcrText && (
                <p className="text-[11px] text-charcoal-500 mt-1">
                  Source OCR Text: “{assessment.selectedClaim.originalOcrText}”
                </p>
              )}
            </div>

            {assessment.productDescription && (
              <p className="text-xs text-charcoal-600">
                <strong className="text-charcoal-700">Description:</strong> {assessment.productDescription}
              </p>
            )}
          </div>

          {/* Evidence Docs Count */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-charcoal-500">
            <span>
              Supporting Files: <strong>{assessment.evidenceDocuments?.length || 0} document(s) attached</strong>
            </span>
            <Link
              to={`/assessments/${assessment._id}/evidence`}
              className="text-forest-700 font-semibold hover:underline"
            >
              Manage Evidence Docs
            </Link>
          </div>
        </div>
      </div>

      {/* Human Review Decision Callout (if already reviewed) */}
      {assessment.humanReviewDecision && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-6 subtle-shadow space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
              <UserCheck className="w-5 h-5 text-indigo-700" />
              <span>Specialist Auditor Determination: {assessment.humanReviewDecision.decision}</span>
            </div>
            <span className="text-[11px] text-indigo-700">
              Reviewed on {new Date(assessment.humanReviewDecision.reviewedAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-xs text-indigo-950 leading-relaxed font-normal bg-white/70 p-3.5 rounded-xl border border-indigo-100">
            {assessment.humanReviewDecision.notes}
          </p>
          {assessment.humanReviewDecision.requestedAdditionalEvidence?.length > 0 && (
            <div className="text-xs text-indigo-900 pt-1">
              <span className="font-semibold block mb-1">Required Additional Evidence:</span>
              <ul className="list-disc list-inside space-y-0.5 text-indigo-800 text-[11px]">
                {assessment.humanReviewDecision.requestedAdditionalEvidence.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Main Assessment Findings */}
      {hasResult ? (
        <div className="space-y-6">
          {/* Executive Explanation */}
          <div className="bg-white rounded-3xl p-6 border border-sage-200 subtle-shadow space-y-3">
            <h3 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-forest-700" />
              <span>Technical Assessment Explanation</span>
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed font-normal bg-mint-50/30 p-4 rounded-2xl border border-sage-100">
              {result.explanation}
            </p>
          </div>

          {/* Supporting Evidence Quotations (Traceable & Verified) */}
          <div className="bg-white rounded-3xl p-6 border border-sage-200 subtle-shadow space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
                  <Quote className="w-5 h-5 text-forest-700" />
                  <span>Substantiating Document Quotations</span>
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Verbatim passages extracted from user-uploaded documents
                </p>
              </div>

              {result.deterministicVerification && (
                <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Deterministic Check: {result.deterministicVerification.quotationsVerifiedInText} /{' '}
                    {result.deterministicVerification.quotationsChecked} quotes located
                  </span>
                </div>
              )}
            </div>

            {result.supportingEvidence?.length > 0 ? (
              <div className="space-y-3">
                {result.supportingEvidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-sage-200 bg-white hover:border-forest-400 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-charcoal-500">
                      <div className="flex items-center gap-1.5 font-semibold text-forest-800">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{ev.documentName}</span>
                        <span className="text-charcoal-400 font-normal">· {ev.pageNumber}</span>
                      </div>
                    </div>

                    <blockquote className="text-xs text-charcoal-800 font-mono italic bg-gray-50/80 p-3 rounded-xl border border-gray-100 border-l-4 border-l-forest-600 leading-relaxed">
                      “{ev.quotation}”
                    </blockquote>

                    {ev.relevance && (
                      <p className="text-[11px] text-charcoal-600">
                        <strong className="text-charcoal-700">Audit Relevance:</strong> {ev.relevance}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-charcoal-500 italic">
                No supporting quotations were cited. The claim is uncorroborated by verified document excerpts.
              </div>
            )}
          </div>

          {/* Missing Requirements & Potential Inconsistencies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Missing Requirements */}
            <div className="bg-white rounded-3xl p-6 border border-sage-200 subtle-shadow space-y-3">
              <h3 className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-amber-600" />
                <span>Missing Technical Requirements</span>
              </h3>
              {result.missingRequirements?.length > 0 ? (
                <ul className="space-y-2 text-xs text-charcoal-700">
                  {result.missingRequirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-charcoal-500 italic">No missing requirements identified.</p>
              )}
            </div>

            {/* Potential Inconsistencies */}
            <div className="bg-white rounded-3xl p-6 border border-sage-200 subtle-shadow space-y-3">
              <h3 className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Potential Inconsistencies</span>
              </h3>
              {result.potentialInconsistencies?.length > 0 ? (
                <ul className="space-y-2 text-xs text-charcoal-700">
                  {result.potentialInconsistencies.map((inc, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-charcoal-500 italic">No material contradictions identified in submitted text.</p>
              )}
            </div>
          </div>

          {/* Uncertainty, Limitations, and Recommended Next Steps */}
          <div className="bg-white rounded-3xl p-6 border border-sage-200 subtle-shadow space-y-4">
            <h3 className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-charcoal-600" />
              <span>Assessment Limitations & Recommended Next Steps</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <span className="font-semibold text-charcoal-800 block">Limitations & Uncertainties</span>
                <ul className="list-disc list-inside space-y-1 text-charcoal-600">
                  {result.limitations?.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                  {result.uncertainties?.map((unc, idx) => (
                    <li key={idx}>{unc}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-mint-50/60 border border-sage-200 space-y-2">
                <span className="font-semibold text-forest-900 block">Recommended Auditor Actions</span>
                <ul className="list-disc list-inside space-y-1 text-forest-800">
                  {result.recommendedActions?.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* In case user views report before running analysis */
        <div className="bg-white rounded-3xl p-8 border border-sage-200 subtle-shadow text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-forest-600 mx-auto" />
          <h3 className="text-base font-bold text-charcoal-900">Assessment In Progress</h3>
          <p className="text-xs text-charcoal-600 max-w-md mx-auto">
            Supporting documents need to be processed to produce an evidence-based report.
          </p>
          <Link
            to={`/assessments/${assessment._id}/evidence`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-700 text-white text-xs font-semibold"
          >
            Go to Evidence Upload
          </Link>
        </div>
      )}

      {/* Review Modal for Authorized Reviewers */}
      <ReviewModal
        assessmentId={assessment._id}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmitted={() => fetchAssessment()}
      />
    </div>
  );
}

export default ReportPage;
