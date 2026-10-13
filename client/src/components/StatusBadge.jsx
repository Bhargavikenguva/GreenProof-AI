import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, ShieldAlert, Clock, FileCheck } from 'lucide-react';

export function StatusBadge({ status, size = 'md', showDescription = false }) {
  const configs = {
    'Supported by available evidence': {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
      label: 'Supported by available evidence',
      symbol: '[SUPPORTED]',
      description: 'Available evidence sufficiently supports the claim within the stated scope.',
    },
    'Insufficient evidence': {
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: AlertCircle,
      label: 'Insufficient evidence',
      symbol: '[INSUFFICIENT]',
      description: 'Available evidence is incomplete or inadequate to substantiate the claim.',
    },
    'Potential inconsistency': {
      bg: 'bg-rose-50 text-rose-800 border-rose-300',
      icon: AlertTriangle,
      label: 'Potential inconsistency',
      symbol: '[INCONSISTENT]',
      description: 'Available evidence materially conflicts with the claim or product identity.',
    },
    'Needs human review': {
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
      icon: ShieldAlert,
      label: 'Needs human review',
      symbol: '[REVIEW REQUIRED]',
      description: 'Assessment involves material ambiguity or requires specialist human judgment.',
    },
    'Claims Detected': {
      bg: 'bg-sky-50 text-sky-800 border-sky-300',
      icon: FileCheck,
      label: 'Claims Detected',
      symbol: '[OCR DETECTED]',
      description: 'Claims detected from packaging photo; awaiting supporting documents.',
    },
    'Evidence Attached': {
      bg: 'bg-teal-50 text-teal-800 border-teal-300',
      icon: FileCheck,
      label: 'Evidence Attached',
      symbol: '[READY]',
      description: 'Supporting documents uploaded and parsed; ready for AI analysis.',
    },
    Draft: {
      bg: 'bg-gray-50 text-gray-700 border-gray-300',
      icon: Clock,
      label: 'Draft',
      symbol: '[DRAFT]',
      description: 'Initial draft assessment record.',
    },
  };

  const current = configs[status] || {
    bg: 'bg-gray-50 text-gray-700 border-gray-300',
    icon: Clock,
    label: status || 'Unknown Status',
    symbol: '[STATUS]',
    description: '',
  };

  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs md:text-sm px-3 py-1 gap-2',
    lg: 'text-sm md:text-base px-4 py-2 gap-2.5 font-semibold',
  };

  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center font-medium rounded-full border ${current.bg} ${sizeClasses[size]}`}
        title={current.label}
      >
        <Icon className={size === 'lg' ? 'w-5 h-5 shrink-0' : 'w-4 h-4 shrink-0'} aria-hidden="true" />
        <span>{current.label}</span>
      </span>
      {showDescription && current.description && (
        <span className="text-xs text-charcoal-500 mt-1.5 max-w-sm">{current.description}</span>
      )}
    </div>
  );
}

export default StatusBadge;
