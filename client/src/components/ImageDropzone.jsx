import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

export function ImageDropzone({ onFileSelected, previewUrl, onClearPreview, selectedFile }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const handleFile = (file) => {
    setError(null);
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file exceeds the 10MB limit. Please upload a smaller photo.');
      return;
    }

    onFileSelected(file);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-sage-300 bg-white shadow-sm group">
          <img
            src={previewUrl}
            alt="Product packaging preview"
            className="w-full h-72 sm:h-80 object-contain bg-charcoal-900/5 p-2"
          />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white/90 backdrop-blur-md text-charcoal-700 hover:text-forest-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border border-gray-200 transition-colors"
            >
              Replace Image
            </button>
            <button
              type="button"
              onClick={onClearPreview}
              className="bg-rose-50 text-rose-700 hover:bg-rose-100 p-1.5 rounded-lg text-xs shadow-md border border-rose-200 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 bg-white border-t border-sage-100 text-xs text-charcoal-600 flex items-center justify-between">
            <span className="font-medium truncate max-w-xs">{selectedFile?.name || 'Selected packaging image'}</span>
            <span className="text-charcoal-400">
              {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : ''}
            </span>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-forest-600 bg-mint-100/50 scale-[1.01]'
              : 'border-sage-300 hover:border-forest-500 bg-white/70 hover:bg-mint-50/40'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-mint-100 text-forest-700 mx-auto flex items-center justify-center mb-4 shadow-inner">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-charcoal-800 mb-1">
            Drop product packaging photo here, or <span className="text-forest-600 underline">browse</span>
          </h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-4">
            Upload a clear photo showing the product packaging and any environmental or sustainability claims (JPG, PNG, WebP up to 10MB).
          </p>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-forest-700 bg-sage-100/80 px-2.5 py-1 rounded-full">
            <ImageIcon className="w-3.5 h-3.5" />
            High resolution recommended for OCR accuracy
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />

      {error && (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default ImageDropzone;
