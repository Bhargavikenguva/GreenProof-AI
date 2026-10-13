import React from 'react';
import { ShieldAlert, Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-forest-900 text-white mt-auto border-t border-forest-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Prominent Legal & AI Disclaimer Box */}
        <div className="bg-forest-800/80 rounded-xl p-5 border border-forest-700/80 mb-8 flex flex-col md:flex-row items-start md:items-center gap-4 text-xs text-sage-200">
          <div className="p-2 rounded-lg bg-forest-700 text-sage-300 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white block text-sm mb-0.5">
              Important Regulatory & Methodological Notice
            </span>
            <p className="leading-relaxed">
              GreenProof AI performs structured technical assessments comparing packaging claims with submitted evidence.
              <strong> AI analysis does not constitute legal certification, government audit, or official environmental validation.</strong>
               Packaging photographs identify visible claims to investigate; only authentic lab reports and accredited standards substantiate scientific claims.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-forest-800 text-xs text-sage-300">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-sage-400" />
            <span className="font-semibold text-white">GreenProof AI</span>
            <span>&copy; {new Date().getFullYear()} — Anti-Greenwashing Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sage-400">Powered by Google Gemini 2.5 & deterministic document verification</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
