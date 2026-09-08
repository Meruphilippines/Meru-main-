"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  FolderOpen,
  Link2,
  Check,
  Loader2,
  Play,
  RefreshCw,
} from "lucide-react";

interface SlotMediaUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  mediaType?: "image" | "video" | "both";
  label?: string;
  helpText?: string;
  placement?: string;
}

interface MediaItemData {
  id: string;
  url: string;
  originalName: string;
  filename: string;
  type: string;
  placement?: string;
  uploadedAt: string;
}

export default function SlotMediaUpload({
  value,
  onChange,
  mediaType = "both",
  label = "Upload Media",
  helpText,
  placement = "general",
}: SlotMediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState(value || "");

  // Library modal state
  const [libraryItems, setLibraryItems] = useState<MediaItemData[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState<"all" | "image" | "video">(
    mediaType === "video" ? "video" : mediaType === "image" ? "image" : "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setManualUrl(value || "");
  }, [value]);

  const acceptedTypes =
    mediaType === "video"
      ? "video/mp4,video/webm,video/quicktime"
      : mediaType === "image"
      ? "image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
      : "image/*,video/mp4,video/webm,video/quicktime";

  const isVideoUrl = (url?: string | null): boolean => {
    if (!url) return false;
    if (mediaType === "video") return true;
    const lower = url.toLowerCase();
    return (
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".mov") ||
      lower.includes("youtube.com") ||
      lower.includes("youtu.be") ||
      lower.includes("vimeo.com")
    );
  };

  const getYoutubeOrVimeoEmbed = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    }
    if (url.includes("vimeo.com")) {
      const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : null;
    }
    return null;
  };

  // Upload file directly to /api/admin/media
  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("placement", placement);
      formData.append("title", file.name);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const result = await res.json();
      if (result.uploaded && result.uploaded.length > 0) {
        const uploadedUrl = result.uploaded[0].url;
        onChange(uploadedUrl);
      } else {
        throw new Error("No media record created");
      }
    } catch (err: any) {
      console.error("Slot upload error:", err);
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUploadFile(files[0]);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUploadFile(files[0]);
    }
  };

  // Fetch library items when opening modal
  const openLibraryModal = async () => {
    setShowLibraryModal(true);
    setIsLoadingLibrary(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setLibraryItems(data);
      }
    } catch (err) {
      console.error("Failed to load media library:", err);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const filteredLibraryItems = libraryItems.filter((item) => {
    if (libraryFilter !== "all" && item.type !== libraryFilter) return false;
    if (mediaType === "image" && item.type !== "image") return false;
    if (mediaType === "video" && item.type !== "video") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.originalName?.toLowerCase().includes(q) ||
        item.filename?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSaveManualUrl = () => {
    onChange(manualUrl.trim());
    setShowUrlInput(false);
  };

  const hasValue = Boolean(value && value.trim().length > 0);
  const isVideo = isVideoUrl(value);
  const embedUrl = hasValue && isVideo ? getYoutubeOrVimeoEmbed(value!) : null;

  return (
    <div className="space-y-2">
      {/* Label and actions */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          {mediaType === "video" ? (
            <VideoIcon className="h-3.5 w-3.5 text-indigo-500" />
          ) : mediaType === "image" ? (
            <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
          ) : (
            <Upload className="h-3.5 w-3.5 text-slate-500" />
          )}
          {label}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openLibraryModal}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline cursor-pointer"
          >
            <FolderOpen className="h-3 w-3" />
            Media Library
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Link2 className="h-3 w-3" />
            {showUrlInput ? "Hide Link" : "Direct Link"}
          </button>
        </div>
      </div>

      {/* Manual URL Input Bar */}
      {showUrlInput && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder={
                mediaType === "video"
                  ? "https://example.com/video.mp4 or YouTube / Vimeo URL"
                  : "https://example.com/image.jpg or /uploads/..."
              }
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
            />
            <button
              type="button"
              onClick={handleSaveManualUrl}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
            >
              Apply
            </button>
          </div>
          <p className="text-[10px] text-slate-500">
            Paste any external media URL, YouTube link, or internal path.
          </p>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="p-1 hover:bg-rose-100 rounded"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Current Preview or Upload Box */}
      {hasValue ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm">
          {/* Media preview render */}
          {isVideo ? (
            embedUrl ? (
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={embedUrl}
                  title="Video Preview"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-black flex items-center justify-center">
                <video
                  src={value!}
                  controls
                  className="max-h-56 w-full object-contain"
                />
              </div>
            )
          ) : (
            <div className="max-h-56 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
              <img
                src={value!}
                alt="Slot Media"
                className="max-h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Action Overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Replace with new upload"
              className="p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-lg backdrop-blur-sm transition-colors text-xs flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Replace</span>
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              title="Remove media"
              className="p-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg backdrop-blur-sm transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Bottom URL info banner */}
          <div className="p-2 bg-slate-900/90 backdrop-blur-sm border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
            <span className="truncate max-w-[80%] font-mono">{value}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              {isVideo ? "Video" : "Image"}
            </span>
          </div>
        </div>
      ) : (
        /* Empty Upload Drop Area */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-blue-500 bg-blue-50/60 scale-[1.01]"
              : "border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-3">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
              <p className="text-xs font-bold text-slate-700">Uploading to server...</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Please wait a moment</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                {mediaType === "video" ? (
                  <VideoIcon className="h-5 w-5" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-700">
                Click to browse or drag & drop {mediaType === "video" ? "video" : mediaType === "image" ? "photo" : "photo/video"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {helpText ||
                  (mediaType === "video"
                    ? "MP4, WebM, QuickTime (or click Direct Link for YouTube)"
                    : mediaType === "image"
                    ? "PNG, JPG, WebP, SVG"
                    : "Photos (JPG, PNG, WebP) or Videos (MP4, WebM)")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Media Library Selector Modal */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  Select from Media Library
                </h3>
                <p className="text-xs text-slate-500">
                  Pick an existing media asset for this slot
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLibraryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
                {mediaType === "both" && (
                  <button
                    type="button"
                    onClick={() => setLibraryFilter("all")}
                    className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                      libraryFilter === "all"
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All
                  </button>
                )}
                {mediaType !== "video" && (
                  <button
                    type="button"
                    onClick={() => setLibraryFilter("image")}
                    className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                      libraryFilter === "image"
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Images
                  </button>
                )}
                {mediaType !== "image" && (
                  <button
                    type="button"
                    onClick={() => setLibraryFilter("video")}
                    className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                      libraryFilter === "video"
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Videos
                  </button>
                )}
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by filename..."
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48 sm:w-64"
              />
            </div>

            {/* Media Items Grid */}
            <div className="p-6 flex-1 overflow-y-auto min-h-[300px]">
              {isLoadingLibrary ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                  <p className="text-xs text-slate-500">Loading media library...</p>
                </div>
              ) : filteredLibraryItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <p className="text-sm font-semibold text-slate-600">No media items found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload a file directly using the drop area above
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredLibraryItems.map((item) => {
                    const isSelected = value === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onChange(item.url);
                          setShowLibraryModal(false);
                        }}
                        className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-600 ring-2 ring-blue-500/30 shadow-md"
                            : "border-slate-200 hover:border-blue-400 hover:shadow-sm"
                        }`}
                      >
                        <div className="aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
                          {item.type === "video" ? (
                            <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-white">
                              <Play className="h-8 w-8 mb-1" />
                              <span className="text-[10px] font-mono uppercase bg-slate-800 px-1 rounded">
                                Video
                              </span>
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt={item.originalName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          )}
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow">
                            <Check className="h-3 w-3" />
                          </div>
                        )}

                        <div className="p-2 bg-white">
                          <p className="text-[11px] font-medium text-slate-700 truncate">
                            {item.originalName || item.filename}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowLibraryModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
