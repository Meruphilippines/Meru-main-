"use client";

import React, { useEffect, useState } from "react";
import {
  Trash2,
  Plus,
  Video as VideoIcon,
  Link as LinkIcon,
  X,
  Play,
  Sliders,
  Check,
  User,
  Clock,
  Layers,
} from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import MediaUpload from "@/components/admin/MediaUpload";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { notifyLiveUpdate } from "@/lib/liveSync";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  title?: string | null;
  caption?: string | null;
  placement?: string | null;
  speaker?: string | null;
  duration?: string | null;
  type: "image" | "video";
  size: number;
  path: string;
  uploadedAt: string;
}

interface EmbedVideo {
  id: string;
  url: string;
  title: string;
  platform: "youtube" | "vimeo" | "other";
  placement?: string;
  speaker?: string;
  duration?: string;
}

const PLACEMENT_LABELS: Record<string, { label: string; color: string }> = {
  general: { label: "General Library", color: "bg-slate-100 text-slate-700 border-slate-200" },
  testimonials: { label: "Testimonials (/testimonials)", color: "bg-purple-50 text-purple-700 border-purple-200" },
  homepage: { label: "Homepage Spotlight", color: "bg-blue-50 text-blue-700 border-blue-200" },
  history: { label: "History Archival", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function AdminVideosPage() {
  const { showToast } = useToast();
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [embeds, setEmbeds] = useState<EmbedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedTitle, setEmbedTitle] = useState("");
  const [embedSpeaker, setEmbedSpeaker] = useState("");
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);

  // Edit Video Modal state
  const [editingVideo, setEditingVideo] = useState<MediaItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editPlacement, setEditPlacement] = useState("general");
  const [editSpeaker, setEditSpeaker] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchVideos = () => {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((data: MediaItem[]) => {
        setVideos(data.filter((m) => m.type === "video"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    const res = await fetch("/api/admin/media", { method: "POST", body: formData });
    if (res.ok) {
      showToast("success", `${files.length} video(s) uploaded!`);
      fetchVideos();
      notifyLiveUpdate();
    } else {
      showToast("error", "Failed to upload video");
      throw new Error("Upload failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    // Check if it's an embed
    const embed = embeds.find((e) => e.id === deleteId);
    if (embed) {
      setEmbeds((prev) => prev.filter((e) => e.id !== deleteId));
      showToast("success", "Embedded video removed");
      setDeleteId(null);
      notifyLiveUpdate();
      return;
    }

    const res = await fetch(`/api/admin/media/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      showToast("success", "Video deleted");
      setVideos((prev) => prev.filter((v) => v.id !== deleteId));
      notifyLiveUpdate();
    } else {
      showToast("error", "Failed to delete video");
    }
    setDeleteId(null);
  };

  const openEditModal = (video: MediaItem) => {
    setEditingVideo(video);
    setEditTitle(video.title || video.originalName.replace(/\.[^/.]+$/, ""));
    setEditPlacement(video.placement || "general");
    setEditSpeaker(video.speaker || "");
    setEditDuration(video.duration || "");
    setEditCaption(video.caption || "");
  };

  const handleSaveEdit = async () => {
    if (!editingVideo) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/admin/media/${editingVideo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          placement: editPlacement,
          speaker: editSpeaker,
          duration: editDuration,
          caption: editCaption,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setVideos((prev) =>
          prev.map((v) => (v.id === editingVideo.id ? { ...v, ...updated } : v))
        );
        showToast("success", "Video placement & details updated!");
        setEditingVideo(null);
        notifyLiveUpdate();
      } else {
        showToast("error", "Failed to update video details");
      }
    } catch {
      showToast("error", "Network error updating video");
    } finally {
      setSavingEdit(false);
    }
  };

  const addEmbed = () => {
    if (!embedUrl) return;
    const platform =
      embedUrl.includes("youtube") || embedUrl.includes("youtu.be")
        ? "youtube"
        : embedUrl.includes("vimeo")
        ? "vimeo"
        : "other";

    const embed: EmbedVideo = {
      id: Date.now().toString(),
      url: embedUrl,
      title: embedTitle || "Untitled Video",
      speaker: embedSpeaker || undefined,
      platform,
      placement: "testimonials",
    };
    setEmbeds((prev) => [...prev, embed]);
    setEmbedUrl("");
    setEmbedTitle("");
    setEmbedSpeaker("");
    setShowEmbed(false);
    showToast("success", "Embedded video added to testimonials!");
  };

  const getEmbedUrl = (url: string): string => {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  const filteredVideos = videos.filter((v) => {
    if (activeFilter === "all") return true;
    return (v.placement || "general") === activeFilter;
  });

  if (loading) return <LoadingSpinner size="lg" label="Loading videos..." />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Videos & Placements</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Upload MP4 videos or embed YouTube links, and specify placements on the website (e.g., Testimonials, Homepage).
          </p>
        </div>
        <button
          onClick={() => setShowEmbed(!showEmbed)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-lg shadow-purple-600/20 self-start sm:self-auto"
        >
          <LinkIcon className="h-3.5 w-3.5" /> Embed Video
        </button>
      </div>

      {/* Embed Form */}
      {showEmbed && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-800">Embed YouTube or Vimeo Video</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Video URL</label>
              <input
                type="url"
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 font-semibold placeholder-slate-400 focus:outline-hidden focus:border-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Title</label>
              <input
                type="text"
                value={embedTitle}
                onChange={(e) => setEmbedTitle(e.target.value)}
                placeholder="e.g. Alumni Testimonial"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 font-semibold placeholder-slate-400 focus:outline-hidden focus:border-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Speaker / Presenter</label>
              <input
                type="text"
                value={embedSpeaker}
                onChange={(e) => setEmbedSpeaker(e.target.value)}
                placeholder="e.g. Rev. Dr. Roland Vaughan"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 font-semibold placeholder-slate-400 focus:outline-hidden focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addEmbed}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
            >
              <Plus className="h-3.5 w-3.5 inline mr-1" /> Add Embed
            </button>
            <button
              onClick={() => setShowEmbed(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <MediaUpload
        accept="video/mp4,video/webm,video/mov"
        onUpload={handleUpload}
        label="Drag & drop video files here, or click to browse"
      />

      {/* Placement Filter */}
      <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
        <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" /> Filter by Placement:
        </span>
        {[
          { key: "all", label: `All Videos (${videos.length})` },
          { key: "testimonials", label: `Testimonials (${videos.filter((v) => v.placement === "testimonials").length})` },
          { key: "homepage", label: `Homepage (${videos.filter((v) => v.placement === "homepage").length})` },
          { key: "history", label: `History (${videos.filter((v) => v.placement === "history").length})` },
          { key: "general", label: `General (${videos.filter((v) => !v.placement || v.placement === "general").length})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeFilter === f.key
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Embedded Videos */}
      {embeds.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Embedded Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {embeds.map((embed) => (
              <div key={embed.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    src={getEmbedUrl(embed.url)}
                    className="w-full h-full"
                    allowFullScreen
                    title={embed.title}
                  />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-700 truncate">{embed.title}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {embed.platform} • {embed.speaker || "General"}
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteId(embed.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Videos */}
      {filteredVideos.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Uploaded Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVideos.map((video) => {
              const placementConfig =
                PLACEMENT_LABELS[video.placement || "general"] || PLACEMENT_LABELS.general;

              return (
                <div
                  key={video.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow overflow-hidden group flex flex-col"
                >
                  <div
                    className="aspect-video bg-slate-900 flex items-center justify-center cursor-pointer relative"
                    onClick={() => setPreviewVideo(video.path)}
                  >
                    <Play className="h-12 w-12 text-white/60 group-hover:text-white/90 group-hover:scale-110 transition-all" />

                    {/* Placement Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-xs backdrop-blur-xs ${placementConfig.color}`}
                      >
                        {placementConfig.label.split("(")[0].trim()}
                      </span>
                    </div>

                    {video.duration && (
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                        {video.duration}
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 truncate">
                        {video.title || video.originalName}
                      </h4>
                      {video.speaker && (
                        <p className="text-xs text-purple-700 font-semibold mt-0.5 flex items-center gap-1">
                          <User className="h-3 w-3" /> {video.speaker}
                        </p>
                      )}
                      {video.caption && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-medium">
                          {video.caption}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {(video.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(video)}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs flex items-center gap-1 transition-colors"
                          title="Set Placement & Speaker"
                        >
                          <Sliders className="h-3 w-3" /> Edit Placement
                        </button>
                        <button
                          onClick={() => setDeleteId(video.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {videos.length === 0 && embeds.length === 0 && (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
          <VideoIcon className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium">No videos uploaded or embedded yet.</p>
        </div>
      )}

      {/* Edit Video Placement Modal */}
      {editingVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingVideo(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-purple-600" />
                <h3 className="font-heading text-lg font-extrabold text-slate-900">
                  Video Placement & Info
                </h3>
              </div>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Placement Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Website Display Location (Placement)
              </label>
              <select
                value={editPlacement}
                onChange={(e) => setEditPlacement(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-purple-500"
              >
                <option value="general">General Media Library</option>
                <option value="testimonials">Video Testimonials Section (/testimonials)</option>
                <option value="homepage">Homepage Video Spotlight</option>
                <option value="history">History Archival Video (/history)</option>
              </select>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Video Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. Empowering Next-Gen Leaders"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-purple-500"
              />
            </div>

            {/* Speaker & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Speaker / Presenter</label>
                <input
                  type="text"
                  value={editSpeaker}
                  onChange={(e) => setEditSpeaker(e.target.value)}
                  placeholder="e.g. Dr. George Pappachen"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-purple-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Duration</label>
                <input
                  type="text"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  placeholder="e.g. 4:15 min"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-purple-500"
                />
              </div>
            </div>

            {/* Caption / Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Caption / Summary</label>
              <textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                rows={2}
                placeholder="Brief description of video contents..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-purple-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Check className="h-4 w-4" />
                {savingEdit ? "Saving..." : "Save Placement"}
              </button>
              <button
                onClick={() => setEditingVideo(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewVideo(null)}
        >
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>
          <video
            src={previewVideo}
            controls
            autoPlay
            className="max-w-full max-h-[85vh] rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Video"
        message="Are you sure you want to delete this video? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
