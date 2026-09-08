"use client";

import React, { useCallback, useState, useRef } from "react";
import { Upload, X, FileImage, FileVideo } from "lucide-react";

interface MediaUploadProps {
  accept?: string;
  multiple?: boolean;
  onUpload: (files: File[]) => Promise<void>;
  label?: string;
}

export default function MediaUpload({
  accept = "image/*,video/mp4,video/webm",
  multiple = true,
  onUpload,
  label = "Drag & drop files here, or click to browse",
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<Array<{ file: File; url: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addPreviews(files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addPreviews(files);
    }
  };

  const addPreviews = (files: File[]) => {
    const selectedFiles = multiple ? files : files.slice(0, 1);
    const newPreviews = selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews((prev) => {
      if (multiple) return [...prev, ...newPreviews];
      prev.forEach((preview) => URL.revokeObjectURL(preview.url));
      return newPreviews;
    });
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;
    setUploading(true);
    try {
      await onUpload(previews.map((p) => p.file));
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);
    } catch {
      // Error handled by parent
    } finally {
      setUploading(false);
    }
  };

  const isVideo = (file: File) => file.type.startsWith("video/");

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-blue-400 bg-blue-50/50 scale-[1.01]"
            : "border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30"
        }`}
      >
        <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragging ? "text-blue-500" : "text-slate-300"}`} />
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WebP, GIF, SVG, MP4, WebM</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {previews.map((preview, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white">
                {isVideo(preview.file) ? (
                  <div className="aspect-video bg-slate-900 flex items-center justify-center">
                    <FileVideo className="h-8 w-8 text-slate-400" />
                  </div>
                ) : (
                  <img
                    src={preview.url}
                    alt={preview.file.name}
                    className="aspect-square object-cover w-full"
                  />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePreview(idx);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="px-2 py-1.5 flex items-center gap-1.5">
                  {isVideo(preview.file) ? (
                    <FileVideo className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <FileImage className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  )}
                  <p className="text-[10px] text-slate-500 truncate">{preview.file.name}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:bg-slate-300"
          >
            {uploading ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload {previews.length} file{previews.length !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
