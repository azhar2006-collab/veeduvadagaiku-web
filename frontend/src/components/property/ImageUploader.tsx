import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Star, AlertCircle } from 'lucide-react';
import { PropertyImage } from '../../types';

interface ImageUploaderProps {
  existingImages?: PropertyImage[];
  newFiles: File[];
  onFilesChange: (files: File[]) => void;
  onDeleteExisting?: (imageId: string) => void;
  onSetPrimaryExisting?: (imageId: string) => void;
  maxFiles?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  existingImages = [],
  newFiles,
  onFilesChange,
  onDeleteExisting,
  onSetPrimaryExisting,
  maxFiles = 10,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalCount = existingImages.length + newFiles.length;

  const onDrop = (acceptedFiles: File[]) => {
    setErrorMsg(null);
    if (totalCount + acceptedFiles.length > maxFiles) {
      setErrorMsg(`You can upload a maximum of ${maxFiles} photos.`);
      return;
    }
    onFilesChange([...newFiles, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: totalCount >= maxFiles,
  });

  const removeNewFile = (index: number) => {
    onFilesChange(newFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Dropzone Area */}
      {totalCount < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
            isDragActive
              ? 'border-orange-500 bg-orange-50/50'
              : 'border-gray-200 hover:border-orange-400 bg-gray-50/50 hover:bg-orange-50/20'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-gray-800 mb-1">
            {isDragActive ? 'Drop images here...' : 'Click or drag photos here to upload'}
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG, or WebP up to 5MB each. (Max {maxFiles} images)
          </p>
          <p className="text-[11px] font-semibold text-orange-600 mt-2">
            {totalCount} of {maxFiles} uploaded
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Existing Images Grid */}
      {(existingImages.length > 0 || newFiles.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
          {existingImages.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group bg-gray-100"
            >
              <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />

              {/* Primary badge */}
              {img.isPrimary && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-orange-600 text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-current" />
                  Primary
                </div>
              )}

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                {!img.isPrimary && onSetPrimaryExisting && (
                  <button
                    type="button"
                    onClick={() => onSetPrimaryExisting(img.id)}
                    className="p-2 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow text-xs font-semibold"
                    title="Set as primary"
                  >
                    <Star className="w-4 h-4 text-amber-500" />
                  </button>
                )}
                {onDeleteExisting && (
                  <button
                    type="button"
                    onClick={() => onDeleteExisting(img.id)}
                    className="p-2 bg-white/90 hover:bg-red-600 hover:text-white text-red-600 rounded-full shadow text-xs"
                    title="Delete image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* New files preview */}
          {newFiles.map((file, idx) => {
            const previewUrl = URL.createObjectURL(file);
            return (
              <div
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden border border-orange-200 bg-gray-100 group shadow-sm"
              >
                <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-semibold rounded backdrop-blur-sm">
                  Ready to upload
                </span>
                <button
                  type="button"
                  onClick={() => removeNewFile(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
