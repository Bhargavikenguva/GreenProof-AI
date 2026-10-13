import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DocumentDropzone from '../components/DocumentDropzone';
import api from '../api/client';
import {
  FileText,
  Upload,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export function EvidenceUploadPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Document upload state
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/assessments/${id}`);
      setAssessment(res.data.assessment);
    } catch (err) {
      setError(err.message || 'Failed to load assessment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const handleUploadDocuments = async (e) => {
    e.preventDefault();
    if (filesToUpload.length === 0) {
      setError('Please select at least one PDF, DOCX, or TXT file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append('evidence', file);
      });

      const res = await api.post(`/assessments/${id}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFilesToUpload([]);
      setAssessment(res.data.assessment);
      await fetchAssessment();
    } catch (err) {
      setError(err.message || 'Failed to upload and extract document text.');
    } finally {
      setUploading(false);
    }
  };

  const handleRunAssessment = async () => {
    try {
      setAnalyzing(true);
      setError(null);

      await api.post(`/assessments/${id}/analyze`);
      navigate(`/assessments/${id}`);
    } catch (err) {
      setError(err.message || 'Assessment execution failed.');
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-xs text-charcoal-500">
        Loading assessment context...
      </div>
    );
  }

  const existingDocs = assessment?.evidenceDocuments || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 uppercase tracking-wider mb-1">
          <span>Stage 4 of 4</span>
          <span>·</span>
          <span>Supporting Evidence & Technical Extraction</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
          Upload Supporting Evidence Documents
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
          Attach laboratory assay certificates, bills of materials, or third-party audits to substantiate the claim.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected Claim Summary Box */}
      <div className="bg-white rounded-2xl p-5 border border-sage-200 subtle-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider block mb-1">
            Product & Target Environmental Claim
          </span>
          <h3 className="font-bold text-charcoal-900 text-sm sm:text-base">
            {assessment?.productName} <span className="font-normal text-charcoal-500">by {assessment?.companyName}</span>
          </h3>
          <p className="text-xs text-forest-800 font-semibold mt-1">
            Investigating: “{assessment?.selectedClaim?.claimText || 'No claim selected'}”
          </p>
        </div>

        <Link
          to={`/assessments/new`}
          className="text-xs text-forest-700 hover:underline font-medium shrink-0"
        >
          Change Claim
        </Link>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-2xl p-6 border border-sage-200 subtle-shadow space-y-4">
        <h3 className="font-semibold text-charcoal-900 text-sm">
          Attach Technical Files (PDF, DOCX, TXT)
        </h3>
        <DocumentDropzone files={filesToUpload} onFilesChange={setFilesToUpload} />

        {filesToUpload.length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleUploadDocuments}
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Extracting Text & Passages...' : 'Upload & Extract Document Text'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Extracted Evidence List */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider block">
          Extracted Evidence Documents ({existingDocs.length})
        </span>

        {existingDocs.length === 0 ? (
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">No Supporting Evidence Uploaded</span>
              <p className="leading-relaxed text-amber-800">
                Without supporting documents (such as ASTM test results or supply-chain certifications), the audit will honestly report <strong>“Insufficient evidence”</strong>. Photographs alone cannot substantiate environmental claims.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {existingDocs.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-sage-200 subtle-shadow space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-mint-100 text-forest-700">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-charcoal-900 text-xs sm:text-sm">
                        {doc.originalName}
                      </h4>
                      <p className="text-[11px] text-charcoal-400">
                        {doc.fileType?.toUpperCase()} · {doc.pageCount || 1} page(s) · Status: {doc.extractionStatus}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Text Parsed
                  </span>
                </div>

                {/* Snippet preview */}
                {doc.extractedText && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-[11px] text-charcoal-600 font-mono line-clamp-3">
                    {doc.extractedText.substring(0, 300)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Run Assessment Action */}
      <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-charcoal-500">
          Ready to verify claim against extracted document passages.
        </p>

        <button
          onClick={handleRunAssessment}
          disabled={analyzing}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-sage-300" />
              <span>Running Evidence-Based Audit...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Run Evidence-Based Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default EvidenceUploadPage;
