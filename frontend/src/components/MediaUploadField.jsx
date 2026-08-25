import { useRef, useState } from "react";
import api from "../api/axios";

/**
 * Shows a URL text input plus an "Upload from device" button. Selecting a
 * file uploads it to the backend (/api/upload) and fills the URL field
 * with the returned link — no manual URL typing required.
 */
export default function MediaUploadField({ id, value, onChange, accept = "image/*,video/*" }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/") && file.size > 4 * 1024 * 1024) {
      setError(
        `Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please use an image under 4MB.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      // Important: don't set Content-Type manually here. Axios needs to
      // generate it itself (including the multipart boundary) — a
      // hardcoded "multipart/form-data" header with no boundary silently
      // corrupts every uploaded file, which is why uploaded photos were
      // showing a broken-image icon instead of the actual picture.
      const { data } = await api.post("/upload", formData);
      onChange(data.url);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          id={id}
          type="text"
          placeholder="Paste an image/video URL, or upload from your device"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="btn btn--sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload from device"}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        style={{ display: "none" }}
      />

      {error && <p className="form-note form-note--error">{error}</p>}

      {value && (
        <div style={{ marginTop: 8 }}>
          {/\.(mp4|webm|mov|ogg)$/i.test(value) ? (
            <video src={value} controls style={{ maxHeight: 120, borderRadius: 8 }} />
          ) : (
            <img src={value} alt="Preview" style={{ maxHeight: 120, borderRadius: 8 }} />
          )}
        </div>
      )}
    </div>
  );
}
