import React, { useRef, useState } from 'react';
import { FileText, Upload, X, AlertCircle, FileCheck, CheckCircle2 } from 'lucide-react';

export function DocumentDropzone({ files, onFilesChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const allowedExts = ['.pdf', '.docx', '.txt'];

  const validateAndAdd = (newFiles) => {
    setError(null);
    const valid = [];
    for (const f of newFiles) {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      if (!allowedExts.includes(ext)) {
        setError(`"${f.name}" has an unsupported format. Please upload PDF, DOCX, or TXT.`);
        continue;
      }
      if (f.size > 15 * 1024 * 1024) {
        setError(`"${f.name}" exceeds the 15MB file size limit.`);
        continue;
      }
      valid.push(f);
    }

    if (valid.length > 0) {
      onFilesChange([...files, ...valid]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      validateAndAdd(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-forest-600 bg-mint-100/50 scale-[1.01]'
            : 'border-sage-300 hover:border-forest-500 bg-white/70 hover:bg-mint-50/40'
        }`}
      >
        <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-700 mx-auto flex items-center justify-center mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-charcoal-800 mb-1">
          Drop technical reports or certificates here, or <span className="text-forest-600 underline">browse</span>
        </p>
        <p className="text-xs text-charcoal-500 max-w-md mx-auto">
          Attach PDF laboratory test reports, DOCX specifications, or TXT audits (max 15MB each, up to 5 files).
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            validateAndAdd(Array.from(e.target.files));
          }
        }}
      />

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected files list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider block">
            Documents to Extract & Audit ({files.length})
          </span>
          <div className="divide-y divide-gray-100 border border-sage-200 rounded-xl bg-white overflow-hidden shadow-sm">
            {files.map((file, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-sage-50/50 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded bg-sage-100 text-forest-700">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-charcoal-800 truncate">{file.name}</p>
                    <p className="text-[11px] text-charcoal-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.name.split('.').pop().toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-1 text-charcoal-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentDropzone;
