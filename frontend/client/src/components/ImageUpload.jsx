// src/components/ImageUpload.jsx
// WHY separate component: reused by MenuEditor, GalleryManager, SpecialsEditor
import { useEffect, useState, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ImageUpload = ({
  currentImageUrl,
  onUploadSuccess,
  token,
  type = "menu",
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const localPreviewRef = useRef(null);

  useEffect(
    () => () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
        localPreviewRef.current = null;
      }
    },
    [],
  );

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // WHY local preview first: user sees the image instantly
    // without waiting for Cloudinary — better UX
    const localPreview = URL.createObjectURL(file);
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
    }
    localPreviewRef.current = localPreview;
    setPreview(localPreview);
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      // WHY "image": must match upload.single("image") in the backend route
      formData.append("image", file);

      const res = await fetch(`${API}/api/upload?type=${type}`, {
        method: "POST",
        headers: {
          // WHY no Content-Type header: browser sets it automatically
          // for FormData including the boundary string — setting it manually breaks uploads
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        // Replace local blob preview with real Cloudinary URL
        if (localPreviewRef.current) {
          URL.revokeObjectURL(localPreviewRef.current);
          localPreviewRef.current = null;
        }
        setPreview(data.imageUrl);
        // Pass URL up to parent form so it saves with the menu item
        onUploadSuccess(data.imageUrl);
      } else {
        if (localPreviewRef.current) {
          URL.revokeObjectURL(localPreviewRef.current);
          localPreviewRef.current = null;
        }
        setError(data.message || "Upload failed.");
        setPreview(currentImageUrl || null); // revert preview on error
      }
    } catch {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
        localPreviewRef.current = null;
      }
      setError("Network error during upload.");
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }
    setPreview(null);
    onUploadSuccess(""); // clear imageUrl in parent form
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-xs font-medium text-[#6b5a47] mb-2">
        Item Image{" "}
        <span className="text-[#999]">(optional · max 5MB · jpg/png/webp)</span>
      </label>

      {preview ? (
        // ── IMAGE PREVIEW ──
        <div className="relative rounded-xl overflow-hidden border border-[#3f2a1d]/20 bg-[#fdf8f0]">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-white text-sm font-medium">Uploading...</div>
            </div>
          )}
          {!uploading && (
            <div className="absolute top-2 right-2 flex gap-1">
              {/* Replace image */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-[#3f2a1d] text-xs px-2 py-1 rounded-full shadow border border-[#3f2a1d]/20 hover:bg-[#f5e8c7]"
              >
                Replace
              </button>
              {/* Remove image */}
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        // ── UPLOAD DROP ZONE ──
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#3f2a1d]/30 rounded-xl p-6 text-center cursor-pointer hover:border-[#c2410c] hover:bg-[#fdf8f0] transition-all"
        >
          {uploading ? (
            <div>
              <div className="text-2xl mb-1">⏳</div>
              <p
                className="text-sm text-[#6b5a47]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Uploading to Cloudinary...
              </p>
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-2">📷</div>
              <p
                className="text-sm text-[#3f2a1d] font-medium"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Click to upload image
              </p>
              <p className="text-xs text-[#999] mt-1">
                JPG, PNG or WebP · max 5MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default ImageUpload;
