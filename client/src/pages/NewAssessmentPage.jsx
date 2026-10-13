import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageDropzone from '../components/ImageDropzone';
import api from '../api/client';
import {
  Camera,
  Sparkles,
  Search,
  CheckCircle2,
  Edit2,
  Plus,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Shield,
  FileCheck,
} from 'lucide-react';

export function NewAssessmentPage() {
  const navigate = useNavigate();

  // Form states
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');

  // Workflow states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Claim detection results (Step 2)
  const [assessmentId, setAssessmentId] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);

  // Selected claim state (Step 3)
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [selectedClaimText, setSelectedClaimText] = useState('');
  const [isEditingClaim, setIsEditingClaim] = useState(false);
  const [isManualClaim, setIsManualClaim] = useState(false);
  const [originalOcrText, setOriginalOcrText] = useState('');
  const [savingClaim, setSavingClaim] = useState(false);

  const handleFileSelected = (file) => {
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError(null);
  };

  const handleClearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  // Step 1 -> Step 2: Upload photo and run claim detection
  const handleAnalyzePhoto = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !productName.trim()) {
      setError('Please provide both company name and product name.');
      return;
    }
    if (!selectedImage) {
      setError('Please upload a product packaging photograph.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('companyName', companyName.trim());
      formData.append('productName', productName.trim());
      formData.append('productDescription', productDescription.trim());

      const res = await api.post('/assessments/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const assessment = res.data.assessment;
      setAssessmentId(assessment._id);
      setDetectionResult(assessment.imageAnalysis);

      // Auto-select first detected claim if available
      if (assessment.imageAnalysis.detectedClaims?.length > 0) {
        const first = assessment.imageAnalysis.detectedClaims[0];
        setSelectedClaimId(first.id);
        setSelectedClaimText(first.claimText);
        setOriginalOcrText(first.exactVisibleText || first.claimText);
        setIsManualClaim(false);
      } else {
        setIsManualClaim(true);
      }
    } catch (err) {
      setError(err.message || 'Image analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 3: Select or Edit claim, then navigate to Step 4 (Evidence)
  const handleProceedToEvidence = async () => {
    if (!selectedClaimText.trim()) {
      setError('Please select or enter an environmental claim to investigate.');
      return;
    }

    try {
      setSavingClaim(true);
      setError(null);

      await api.patch(`/assessments/${assessmentId}/select-claim`, {
        claimId: selectedClaimId,
        claimText: selectedClaimText.trim(),
        isManual: isManualClaim,
        originalOcrText: originalOcrText,
      });

      // Proceed to evidence upload page
      navigate(`/assessments/${assessmentId}/evidence`);
    } catch (err) {
      setError(err.message || 'Failed to save selected claim.');
    } finally {
      setSavingClaim(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Step Tracker Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 uppercase tracking-wider mb-1">
          <span>Stage {detectionResult ? '3 of 4' : '1 of 4'}</span>
          <span>·</span>
          <span>{detectionResult ? 'Claim Selection' : 'Packaging Image Capture'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
          {detectionResult ? 'Select Claim to Investigate' : 'Upload Product Packaging Photograph'}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
          {detectionResult
            ? 'Review AI-detected environmental claims from packaging or input a specific claim manually.'
            : 'Capture or upload packaging labels. Our multimodal vision system will identify visible sustainability claims.'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!detectionResult ? (
        /* STEP 1: Upload Photo & Enter Metadata */
        <form onSubmit={handleAnalyzePhoto} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Image Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
                Product Packaging Photo *
              </label>
              <ImageDropzone
                onFileSelected={handleFileSelected}
                previewUrl={previewUrl}
                onClearPreview={handleClearPreview}
                selectedFile={selectedImage}
              />
            </div>

            {/* Right: Product & Company Details */}
            <div className="bg-white rounded-2xl p-6 border border-sage-200 subtle-shadow space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-semibold text-charcoal-900 text-sm">Product Metadata</h3>
                  <p className="text-[11px] text-charcoal-500">Provide manufacturer and product context</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1 uppercase tracking-wider">
                    Company / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. EcoPure Consumer Goods"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1 uppercase tracking-wider">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. 100% Compostable Cold Beverage Cup"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1 uppercase tracking-wider">
                    Optional Product Description / Notes
                  </label>
                  <textarea
                    rows={3}
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="e.g. Translucent PLA packaging with leaf emblem and green banner..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isAnalyzing || !selectedImage}
                className="w-full py-3.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-sage-300" />
                    <span>Gemini AI is analyzing packaging claims...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Detect Visible Environmental Claims</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* STEP 2 & 3: REVIEW DETECTED CLAIMS & SELECT */
        <div className="space-y-6">
          {/* Observation banner */}
          <div className="p-4 rounded-2xl bg-white border border-sage-200 subtle-shadow space-y-2">
            <div className="flex items-center gap-2 text-forest-800 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-forest-600" />
              <span>Multimodal Vision OCR Findings</span>
            </div>
            <p className="text-xs text-charcoal-700 leading-relaxed">
              {detectionResult.productDescription || 'Product packaging processed.'}
            </p>
            {detectionResult.imageObservations && (
              <p className="text-[11px] text-charcoal-500 italic">
                Observations: {detectionResult.imageObservations}
              </p>
            )}
            {detectionResult.ocrUncertainty && (
              <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                <span>OCR Ambiguity: {detectionResult.ocrUncertainty}</span>
              </div>
            )}
          </div>

          {/* If no claims detected */}
          {!detectionResult.hasVisibleEnvironmentalClaims ||
          detectionResult.detectedClaims?.length === 0 ? (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-700 mx-auto" />
              <h3 className="font-semibold text-charcoal-900 text-sm">
                No Readable Environmental Claims Identified
              </h3>
              <p className="text-xs text-charcoal-600 max-w-md mx-auto">
                No explicit sustainability claims (e.g., “100% biodegradable”, “carbon neutral”, “recycled”) were detected on the packaging. You can enter an environmental claim manually below.
              </p>
            </div>
          ) : (
            /* Detected Claims Cards */
            <div className="space-y-3">
              <span className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider block">
                Detected Packaging Claims ({detectionResult.detectedClaims.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detectionResult.detectedClaims.map((claim) => {
                  const isSelected = selectedClaimId === claim.id && !isManualClaim;
                  return (
                    <div
                      key={claim.id}
                      onClick={() => {
                        setSelectedClaimId(claim.id);
                        setSelectedClaimText(claim.claimText);
                        setOriginalOcrText(claim.exactVisibleText || claim.claimText);
                        setIsManualClaim(false);
                        setIsEditingClaim(false);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-forest-600 bg-mint-50/60 ring-2 ring-forest-600/20 shadow-md'
                          : 'border-sage-200 bg-white hover:border-forest-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-forest-700 bg-forest-700 text-white'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <h4 className="font-semibold text-charcoal-900 text-sm">
                            “{claim.claimText}”
                          </h4>
                        </div>
                        <span className="text-[10px] font-semibold text-forest-800 bg-forest-100 px-2 py-0.5 rounded-full shrink-0">
                          {Math.round((claim.confidence || 0.9) * 100)}% match
                        </span>
                      </div>

                      {claim.exactVisibleText && (
                        <p className="text-[11px] text-charcoal-500 mb-2 pl-6">
                          Exact Visible Text: <span className="font-medium text-charcoal-700">“{claim.exactVisibleText}”</span>
                        </p>
                      )}

                      {claim.locationOnPackage && (
                        <p className="text-[11px] text-charcoal-400 pl-6 mb-2">
                          Location: {claim.locationOnPackage}
                        </p>
                      )}

                      {claim.recommendedEvidence?.length > 0 && (
                        <div className="pl-6 pt-2 border-t border-gray-100 text-[11px] text-charcoal-600">
                          <span className="font-semibold text-charcoal-700 block mb-0.5">Recommended Evidence:</span>
                          <ul className="list-disc list-inside space-y-0.5 text-charcoal-500">
                            {claim.recommendedEvidence.slice(0, 2).map((item, idx) => (
                              <li key={idx} className="truncate">{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Edit or Manual Claim Input */}
          <div className="bg-white rounded-2xl p-5 border border-sage-200 subtle-shadow space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider">
                Investigated Claim Text
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsManualClaim(true);
                  setSelectedClaimId('manual_' + Date.now());
                }}
                className="text-xs font-medium text-forest-700 hover:text-forest-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enter Custom Claim Manually</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={selectedClaimText}
                onChange={(e) => {
                  setSelectedClaimText(e.target.value);
                  setIsManualClaim(true);
                }}
                placeholder="e.g. 100% biodegradable within 30 days under ASTM D5511"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs sm:text-sm font-medium"
              />
            </div>
            <p className="text-[11px] text-charcoal-400">
              You can edit or refine the OCR claim to ensure complete accuracy before proceeding to evidence extraction.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setDetectionResult(null)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-charcoal-600 hover:bg-gray-50 text-xs font-medium"
            >
              Back to Image Upload
            </button>

            <button
              type="button"
              onClick={handleProceedToEvidence}
              disabled={savingClaim || !selectedClaimText.trim()}
              className="px-6 py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span>{savingClaim ? 'Saving...' : 'Proceed to Supporting Evidence'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewAssessmentPage;
