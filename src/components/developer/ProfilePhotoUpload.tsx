"use client";

import { useState, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// FE-011 · ProfilePhotoUpload
//
// Usage:
//   <ProfilePhotoUpload
//     currentUrl={user.avatarUrl}
//     onUploadComplete={(url) => updateProfile({ avatarUrl: url })}
//   />
//
// Supabase upload wiring:
//   Replace the TODO block in handleSave with your actual upload call.
//   The component hands you a `croppedBlob` ready to upload.
// ─────────────────────────────────────────────

interface ProfilePhotoUploadProps {
  currentUrl?: string | null;
  onUploadComplete?: (publicUrl: string) => void;
  onError?: (msg: string) => void;
}

const MAX_MB = 2;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const CANVAS_SIZE = 300; // output square px

export default function ProfilePhotoUpload({
  currentUrl,
  onUploadComplete,
  onError,
}: ProfilePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);

  // crop state: offset + scale of the image inside the 300×300 frame
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // ── File selection ──────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSaved(false);

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      const msg = "Only JPG and PNG files are allowed.";
      setError(msg);
      onError?.(msg);
      return;
    }
    if (file.size > MAX_BYTES) {
      const msg = `File must be under ${MAX_MB}MB.`;
      setError(msg);
      onError?.(msg);
      return;
    }

    const url = URL.createObjectURL(file);
    setRawSrc(url);
    setOffset({ x: 0, y: 0 });
    setScale(1);
    setPreview(null);
  };

  // ── Drag to reposition ───────────────────────

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragStart.current) return;
      setOffset({
        x: dragStart.current.ox + (e.clientX - dragStart.current.mx),
        y: dragStart.current.oy + (e.clientY - dragStart.current.my),
      });
    },
    []
  );

  const stopDrag = () => { dragStart.current = null; };

  // ── Save / upload ────────────────────────────

  const handleSave = async () => {
    if (!rawSrc || !canvasRef.current || !imgRef.current) return;

    setUploading(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not available");

      const img = imgRef.current;
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;

      // Compute displayed image size (same logic as CSS)
      const displayedW = naturalW * scale;
      const displayedH = naturalH * scale;

      // Map canvas pixels back to natural image coordinates
      const scaleX = naturalW / displayedW;
      const scaleY = naturalH / displayedH;

      const srcX = (-offset.x) * scaleX;
      const srcY = (-offset.y) * scaleY;
      const srcSize = CANVAS_SIZE * scaleX;

      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
          "image/jpeg",
          0.92
        );
      });

      // ── TODO: replace with Supabase Storage upload ──────────────────────
      // import { createClient } from "@/lib/supabase";
      // const supabase = createClient();
      // const fileName = `avatars/${Date.now()}.jpg`;
      // const { error: uploadError } = await supabase.storage
      //   .from("profiles")
      //   .upload(fileName, blob, { contentType: "image/jpeg", upsert: true });
      // if (uploadError) throw uploadError;
      // const { data } = supabase.storage.from("profiles").getPublicUrl(fileName);
      // const publicUrl = data.publicUrl;
      // onUploadComplete?.(publicUrl);
      // ───────────────────────────────────────────────────────────────────

      // Mock: show cropped result locally
      const localUrl = URL.createObjectURL(blob);
      setPreview(localUrl);
      setRawSrc(null);
      setSaved(true);
      onUploadComplete?.(localUrl); // replace with publicUrl from Supabase
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      onError?.(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setRawSrc(null);
    setError(null);
    setSaved(false);
  };

  const inCropMode = !!rawSrc;

  return (
    <>
      <style>{`
        .photo-wrap { display: flex; flex-direction: column; align-items: center; gap: 1rem; }

        /* ── Avatar ring ── */
        .avatar-ring {
          width: 88px; height: 88px; border-radius: 50%;
          background: #F5F3F0;
          border: 2px dashed #E8E4DF;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; cursor: pointer; position: relative;
          transition: border-color 0.15s;
          flex-shrink: 0;
        }
        .avatar-ring:hover { border-color: #FF6B4D; }
        .avatar-ring img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-ring .avatar-overlay {
          position: absolute; inset: 0; background: rgba(255,107,77,0.55);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.15s; border-radius: 50%;
        }
        .avatar-ring:hover .avatar-overlay { opacity: 1; }

        /* ── Crop frame ── */
        .crop-area {
          width: 300px; height: 300px; border-radius: 16px;
          overflow: hidden; position: relative; background: #1A1A1A;
          cursor: grab; user-select: none;
          box-shadow: 0 4px 24px rgba(0,0,0,0.15);
        }
        .crop-area:active { cursor: grabbing; }
        .crop-area img {
          position: absolute;
          transform-origin: top left;
        }
        .crop-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px);
          background-size: 100px 100px;
        }
        .crop-circle-guide {
          position: absolute; inset: 0; pointer-events: none;
          border-radius: 50%;
          box-shadow: 0 0 0 300px rgba(0,0,0,0.45);
        }

        /* ── Zoom slider ── */
        .zoom-row {
          display: flex; align-items: center; gap: 0.75rem; width: 300px;
        }
        .zoom-icon { color: #B0A89E; flex-shrink: 0; }
        .zoom-slider {
          flex: 1; -webkit-appearance: none; appearance: none;
          height: 4px; border-radius: 2px; outline: none; cursor: pointer;
          background: linear-gradient(
            90deg,
            #FF6B4D calc((var(--val) - 1) / 2 * 100%),
            #E8E4DF calc((var(--val) - 1) / 2 * 100%)
          );
        }
        .zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 16px; height: 16px;
          border-radius: 50%; background: #FF6B4D;
          box-shadow: 0 1px 6px rgba(255,107,77,0.4); cursor: pointer;
        }

        /* ── Action buttons ── */
        .crop-actions { display: flex; gap: 0.625rem; width: 300px; }

        .btn-crop-cancel {
          flex: 1; height: 44px; border-radius: 50px;
          border: 1.5px solid #E8E4DF; background: white;
          font-size: 13.5px; font-weight: 600; color: #6B6560;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s;
        }
        .btn-crop-cancel:hover { border-color: #B0A89E; }

        .btn-crop-save {
          flex: 2; height: 44px; border-radius: 50px; border: none;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          color: white; font-size: 13.5px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 3px 14px rgba(255,107,77,0.28);
          transition: opacity 0.15s, transform 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .btn-crop-save:hover:not(:disabled) { transform: translateY(-1px); }
        .btn-crop-save:disabled { opacity: 0.5; cursor: not-allowed; }

        .photo-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .photo-hint {
          font-size: 12px; color: #B0A89E; text-align: center; line-height: 1.5;
        }
        .photo-error { font-size: 12px; color: #FF3B30; font-weight: 500; }
        .photo-saved { font-size: 12px; color: #22C55E; font-weight: 600; }

        .btn-change-photo {
          font-size: 13px; color: #FF6B4D; font-weight: 600;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; padding: 0;
        }
        .btn-change-photo:hover { text-decoration: underline; }
      `}</style>

      {/* Hidden canvas for crop rendering */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="photo-wrap">
        {inCropMode ? (
          <>
            {/* Crop frame */}
            <div
              className="crop-area"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDrag}
              onMouseLeave={stopDrag}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={rawSrc!}
                alt="crop preview"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transformOrigin: "top left",
                  maxWidth: "none",
                  width: CANVAS_SIZE,
                }}
                draggable={false}
              />
              <div className="crop-grid" />
              <div className="crop-circle-guide" />
            </div>

            {/* Zoom */}
            <div className="zoom-row">
              <span className="zoom-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </span>
              <input
                type="range" min="1" max="3" step="0.05"
                value={scale}
                className="zoom-slider"
                style={{ "--val": scale } as React.CSSProperties}
                onChange={(e) => setScale(parseFloat(e.target.value))}
              />
              <span className="zoom-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </span>
            </div>

            {/* Actions */}
            <div className="crop-actions">
              <button className="btn-crop-cancel" onClick={handleCancel} type="button">
                Cancel
              </button>
              <button
                className="btn-crop-save"
                onClick={handleSave}
                disabled={uploading}
                type="button"
              >
                {uploading ? <span className="photo-spinner" /> : "Save photo"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Avatar preview */}
            <div className="avatar-ring" onClick={() => fileInputRef.current?.click()}>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Profile photo" />
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B0A89E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              )}
              <div className="avatar-overlay">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            </div>

            {saved ? (
              <span className="photo-saved">✓ Photo saved</span>
            ) : (
              <button
                type="button"
                className="btn-change-photo"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? "Change photo" : "Upload photo"}
              </button>
            )}

            <p className="photo-hint">JPG or PNG · max {MAX_MB}MB</p>
          </>
        )}

        {error && <p className="photo-error">{error}</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
    </>
  );
}