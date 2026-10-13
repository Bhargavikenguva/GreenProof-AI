import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Search, FileSpreadsheet, ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, Scale, Sparkles } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Background decorative gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-mint-200/40 via-mint-100/20 to-transparent pointer-events-none rounded-3xl blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-100 border border-forest-200/60 text-forest-800 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-forest-600" />
            AI-Assisted Packaging Claim Auditing
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-charcoal-900 leading-[1.15] mb-6">
            Can Your Green Claims <br />
            <span className="text-forest-700 bg-gradient-to-r from-forest-800 to-forest-600 bg-clip-text text-transparent">
              Be Proven?
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-charcoal-700 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Upload a product photo, identify environmental claims, and investigate whether available evidence supports them.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/assessments/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all card-hover"
            >
              <span>Analyze a Product</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-sage-50 text-charcoal-800 font-semibold text-base border border-sage-200 shadow-sm transition-all"
            >
              <span>View Dashboard</span>
            </Link>
          </div>

          {/* Core Principle Badge */}
          <div className="mt-12 inline-flex items-center gap-2 text-xs text-charcoal-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-sage-200">
            <Scale className="w-4 h-4 text-forest-700 shrink-0" />
            <span>Photographs detect claims to investigate. Scientific evidence determines substantiation.</span>
          </div>
        </div>
      </section>

      {/* 4-Step Exact Workflow Explainer */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 mb-3">
            How GreenProof AI Works
          </h2>
          <p className="text-sm text-charcoal-600 max-w-xl mx-auto">
            A deterministic, 4-stage audit pipeline designed to prevent false marketing claims and substantiate legitimate green packaging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-sage-200 subtle-shadow flex flex-col relative card-hover">
            <div className="w-10 h-10 rounded-xl bg-mint-100 text-forest-700 flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <div className="flex items-center gap-2 mb-2 text-forest-800">
              <Camera className="w-4 h-4 text-forest-600" />
              <h3 className="font-semibold text-base">Upload a Photograph</h3>
            </div>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Capture or upload packaging photos (JPG, PNG, WebP). Enter product and manufacturer metadata for context.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-sage-200 subtle-shadow flex flex-col relative card-hover">
            <div className="w-10 h-10 rounded-xl bg-mint-100 text-forest-700 flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <div className="flex items-center gap-2 mb-2 text-forest-800">
              <Search className="w-4 h-4 text-forest-600" />
              <h3 className="font-semibold text-base">Detect Claims</h3>
            </div>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Gemini Vision scans labels for visible environmental claims (e.g., “100% biodegradable”, “80% recycled”), noting OCR confidence.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-sage-200 subtle-shadow flex flex-col relative card-hover">
            <div className="w-10 h-10 rounded-xl bg-mint-100 text-forest-700 flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <div className="flex items-center gap-2 mb-2 text-forest-800">
              <FileSpreadsheet className="w-4 h-4 text-forest-600" />
              <h3 className="font-semibold text-base">Add Evidence</h3>
            </div>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Attach PDF lab reports, DOCX specifications, or TXT audits. The backend extracts text and preserves page citations.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 border border-sage-200 subtle-shadow flex flex-col relative card-hover">
            <div className="w-10 h-10 rounded-xl bg-mint-100 text-forest-700 flex items-center justify-center font-bold text-sm mb-4">
              04
            </div>
            <div className="flex items-center gap-2 mb-2 text-forest-800">
              <ShieldCheck className="w-4 h-4 text-forest-600" />
              <h3 className="font-semibold text-base">Receive Report</h3>
            </div>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Receive a rigorous assessment classifying the claim into one of 4 standardized statuses, with verifiable quote citations.
            </p>
          </div>
        </div>
      </section>

      {/* The 4 Standard Status Labels Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-sage-200 subtle-shadow">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
              Rigorous 4-Tier Assessment Standards
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 max-w-lg mx-auto">
              We never classify unsupported claims as fraud, and never treat absence of contradictory evidence as proof of truth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <span className="text-xs font-bold text-emerald-900 block mb-1">Supported by available evidence</span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Available evidence sufficiently supports the claim within the stated scope, with no unresolved material contradiction.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
              <span className="text-xs font-bold text-amber-900 block mb-1">Insufficient evidence</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Available evidence is incomplete, irrelevant, or inadequate to substantiate the claim, but no contradiction is established.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
              <span className="text-xs font-bold text-rose-900 block mb-1">Potential inconsistency</span>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                Available evidence materially conflicts with the claim, such as a different product identity or contradictory test result.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">
              <span className="text-xs font-bold text-indigo-900 block mb-1">Needs human review</span>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Assessment involves material ambiguity, specialist judgment, or questionable authenticity that cannot be evaluated automatically.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
