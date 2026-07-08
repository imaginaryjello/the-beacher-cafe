// src/pages/Dashboard/GalleryManager.jsx
import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─────────────────────────────────────────
// SHARED IMAGE UPLOADER
// Handles the two-step upload pattern:
//   1. POST file to /api/upload → get back imageUrl + publicId from Cloudinary
//   2. Caller decides what to do with those values (save to gallery or special)
// WHY two steps: one upload endpoint serves gallery, specials, and menu uniformly
// ─────────────────────────────────────────
const ImageUploader = ({ onUploaded, type, token, disabled }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show a local preview instantly while we wait for Cloudinary
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API}/api/upload?type=${type}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      // WHY check res.ok before res.json(): if the server returns an error as
      // HTML (e.g. multer crash, unhandled Express error), res.json() would throw
      // a SyntaxError that looks like a "network error" but is actually a server error.
      if (!res.ok) {
        const text = await res.text();
        console.error("Upload server error:", res.status, text);
        alert(`Upload failed (${res.status}). Check the browser console for details.`);
        setPreview(null);
        return;
      }

      const data = await res.json();

      if (data.success) {
        onUploaded({ imageUrl: data.imageUrl, publicId: data.publicId });
      } else {
        alert("Upload failed: " + data.message);
        setPreview(null);
      }
    } catch (err) {
      // This catch only runs if the request never got a response at all
      // (e.g. server is down, CORS preflight rejected, DNS failure)
      console.error("Upload fetch error:", err);
      alert("Could not reach the server. Is the backend running on port 5000?");
      setPreview(null);
    } finally {
      // WHY finally: setUploading(false) must run whether the upload succeeds,
      // fails, or throws — otherwise the button stays stuck on "Uploading..." forever
      setUploading(false);
    }
  };

  return (
    <div>
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-32 object-cover rounded-lg mb-2 border border-[#3f2a1d]/20"
        />
      )}
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full py-2 border-2 border-dashed border-[#3f2a1d]/30 rounded-lg text-sm text-[#6b5a47] hover:border-[#c2410c] hover:text-[#c2410c] transition-colors disabled:opacity-50"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {uploading ? "Uploading..." : preview ? "Change Image" : "Click to upload image"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
};

// ─────────────────────────────────────────
// GALLERY TAB
// Upload images → save to DB → display grid
// ─────────────────────────────────────────
const GalleryTab = ({ token }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form state for the "add image" panel
  const [pendingUpload, setPendingUpload] = useState(null); // { imageUrl, publicId }
  const [caption, setCaption] = useState("");
  const [order, setOrder] = useState(0);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/gallery`);
      const data = await res.json();
      if (data.success) setImages(data.images);
      else setError(data.message);
    } catch {
      setError("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Step 2 of the two-step upload: save URL + metadata to MongoDB
  const handleSave = async () => {
    if (!pendingUpload) {
      setError("Please upload an image first");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/gallery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: pendingUpload.imageUrl,
          publicId: pendingUpload.publicId,
          caption,
          order: Number(order),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingUpload(null);
        setCaption("");
        setOrder(0);
        setShowAddPanel(false);
        await fetchImages();
        showSuccess("Image added to gallery");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/gallery/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDeletingId(null);
        await fetchImages();
        showSuccess("Image deleted");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="text-sm text-[#6b5a47]" style={{ fontFamily: "Georgia, serif" }}>
          {images.length} image{images.length !== 1 ? "s" : ""} in gallery
        </p>
        {!showAddPanel && (
          <button
            onClick={() => setShowAddPanel(true)}
            className="bg-[#c2410c] hover:bg-[#9a3009] text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
            style={{ fontFamily: "Georgia, serif" }}
          >
            + Add Image
          </button>
        )}
      </div>

      {/* Success / Error */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm mb-4">
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">×</button>
        </div>
      )}

      {/* Add image panel */}
      {showAddPanel && (
        <div className="bg-white border-2 border-[#c2410c]/30 rounded-xl p-5 mb-6 shadow-sm">
          <h3
            className="text-base font-semibold text-[#3f2a1d] mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Add New Image
          </h3>
          <div className="space-y-3">
            {/* WHY type="gallery": tells /api/upload which Cloudinary folder to use */}
            <ImageUploader
              type="gallery"
              token={token}
              disabled={saving}
              onUploaded={(data) => setPendingUpload(data)}
            />
            <div>
              <label className="block text-xs font-medium text-[#6b5a47] mb-1">
                Caption (optional)
              </label>
              <input
                className="w-full px-3 py-2 border border-[#3f2a1d]/20 rounded-lg text-sm text-[#3f2a1d] bg-[#fdf8f0] focus:outline-none focus:border-[#c2410c]"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Sunday brunch crowd"
                style={{ fontFamily: "Georgia, serif" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b5a47] mb-1">
                Order <span className="text-[#999]">(lower = appears first)</span>
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-[#3f2a1d]/20 rounded-lg text-sm text-[#3f2a1d] bg-[#fdf8f0] focus:outline-none focus:border-[#c2410c]"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSave}
                disabled={saving || !pendingUpload}
                className="flex-1 bg-[#3f2a1d] hover:bg-[#5a3e2b] text-[#f5e8c7] py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {saving ? "Saving..." : "Save to Gallery"}
              </button>
              <button
                onClick={() => { setShowAddPanel(false); setPendingUpload(null); setCaption(""); setOrder(0); }}
                disabled={saving}
                className="px-5 py-2.5 rounded-full border-2 border-[#3f2a1d] text-[#3f2a1d] text-sm hover:bg-[#f5e8c7] transition-colors disabled:opacity-50"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-white rounded-xl animate-pulse border border-[#3f2a1d]/10" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🖼️</p>
          <p className="text-[#3f2a1d]" style={{ fontFamily: "Georgia, serif" }}>
            No images yet — add your first one above
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img._id}
              className="group relative aspect-square rounded-xl overflow-hidden border border-[#3f2a1d]/10 shadow-sm"
            >
              <img
                src={img.imageUrl}
                alt={img.caption || "Gallery image"}
                className="w-full h-full object-cover"
              />
              {/* Overlay with caption + delete.
                  WHY visible at base: phones have no hover, so an opacity-0
                  button would be an invisible tap target. Hover-reveal only
                  kicks in from md+ where a cursor exists. */}
              <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/50 transition-colors duration-200 flex flex-col justify-between p-2">
                {img.caption && (
                  <p className="text-white text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-black/40 rounded px-1.5 py-0.5 self-start">
                    {img.caption}
                  </p>
                )}
                <button
                  onClick={() => setDeletingId(img._id)}
                  className="self-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-red-600 text-white text-xs px-3 py-2 md:px-2 md:py-1 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-[#f5e8c7] border-2 border-[#3f2a1d] rounded-xl max-w-sm w-full p-6 shadow-xl">
            <p className="text-[#3f2a1d] text-base mb-2 font-semibold" style={{ fontFamily: "Georgia, serif" }}>
              Delete this image?
            </p>
            <p className="text-[#6b5a47] text-sm mb-6" style={{ fontFamily: "Georgia, serif" }}>
              It will be permanently removed from both the gallery and Cloudinary.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 rounded-full border-2 border-[#3f2a1d] text-[#3f2a1d] text-sm"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={saving}
                className="flex-1 py-2 rounded-full bg-red-600 text-white text-sm disabled:opacity-50"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// SPECIAL FORM (shared by add + edit)
// ─────────────────────────────────────────
const EMPTY_SPECIAL = {
  title: "",
  price: "",
  description: "",
  imageUrl: "",
  publicId: "",
  displayOrder: 0,
};

const SpecialForm = ({ initial, onSave, onCancel, saving, token }) => {
  const [form, setForm] = useState(initial || EMPTY_SPECIAL);
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (form.price === "" || form.price === null) e.price = "Price is required";
    else if (isNaN(Number(form.price)) || Number(form.price) < 0) e.price = "Price must be a positive number";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave({ ...form, price: Number(form.price) });
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm text-[#3f2a1d] bg-[#fdf8f0] focus:outline-none focus:border-[#c2410c] transition-colors ${
      errors[field] ? "border-red-400" : "border-[#3f2a1d]/20"
    }`;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[#6b5a47] mb-1">Title *</label>
        <input
          className={inputClass("title")}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Smoked Salmon Bagel"
          style={{ fontFamily: "Georgia, serif" }}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#6b5a47] mb-1">Price ($) *</label>
          <input
            className={inputClass("price")}
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="11.99"
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6b5a47] mb-1">
            Order <span className="text-[#999]">(lower = first)</span>
          </label>
          <input
            className={inputClass("displayOrder")}
            type="number"
            min="0"
            value={form.displayOrder}
            onChange={(e) => set("displayOrder", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#6b5a47] mb-1">Description</label>
        <textarea
          className={inputClass("description")}
          rows={2}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Short description..."
          style={{ fontFamily: "Georgia, serif", resize: "none" }}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#6b5a47] mb-1">Image</label>
        {/* WHY type="specials": routes the file to beacher-cafe/specials folder in Cloudinary */}
        <ImageUploader
          type="specials"
          token={token}
          disabled={saving}
          onUploaded={({ imageUrl, publicId }) => {
            set("imageUrl", imageUrl);
            set("publicId", publicId);
          }}
        />
        {form.imageUrl && !form.imageUrl.startsWith("blob:") && (
          <img
            src={form.imageUrl}
            alt="Current"
            className="mt-2 w-full h-28 object-cover rounded-lg border border-[#3f2a1d]/20"
          />
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 bg-[#3f2a1d] hover:bg-[#5a3e2b] text-[#f5e8c7] py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {saving ? "Saving..." : initial ? "Save Changes" : "Add Special"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-5 py-2.5 rounded-full border-2 border-[#3f2a1d] text-[#3f2a1d] text-sm hover:bg-[#f5e8c7] transition-colors disabled:opacity-50"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// SPECIALS TAB
// ─────────────────────────────────────────
const SpecialsTab = ({ token }) => {
  const [specials, setSpecials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const fetchSpecials = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/specials`);
      const data = await res.json();
      if (data.success) setSpecials(data.specials);
      else setError(data.message);
    } catch {
      setError("Failed to load specials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSpecials(); }, []);

  const handleAdd = async (formData) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/specials`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddForm(false);
        await fetchSpecials();
        showSuccess(`"${data.special.title}" added`);
      } else { setError(data.message); }
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  };

  const handleEdit = async (formData) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/specials/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setEditingItem(null);
        await fetchSpecials();
        showSuccess(`"${data.special.title}" updated`);
      } else { setError(data.message); }
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/specials/${deletingItem._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDeletingItem(null);
        await fetchSpecials();
        showSuccess(data.message);
      } else { setError(data.message); }
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (item) => {
    try {
      const res = await fetch(`${API}/api/specials/${item._id}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: !item.active }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSpecials();
        showSuccess(data.message);
      }
    } catch { setError("Network error."); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="text-sm text-[#6b5a47]" style={{ fontFamily: "Georgia, serif" }}>
          {specials.length} special{specials.length !== 1 ? "s" : ""} ·{" "}
          {specials.filter((s) => s.active).length} active on home page
        </p>
        {!showAddForm && !editingItem && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#c2410c] hover:bg-[#9a3009] text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
            style={{ fontFamily: "Georgia, serif" }}
          >
            + Add Special
          </button>
        )}
      </div>

      {/* Success / Error */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm mb-4">
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">×</button>
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white border-2 border-[#c2410c]/30 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#3f2a1d] mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Add New Special
          </h3>
          <SpecialForm
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
            saving={saving}
            token={token}
          />
        </div>
      )}

      {/* Edit form */}
      {editingItem && (
        <div className="bg-white border-2 border-[#c2410c]/30 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#3f2a1d] mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Editing: {editingItem.title}
          </h3>
          <SpecialForm
            initial={{
              title: editingItem.title,
              price: editingItem.price,
              description: editingItem.description || "",
              imageUrl: editingItem.imageUrl || "",
              publicId: editingItem.publicId || "",
              displayOrder: editingItem.displayOrder || 0,
            }}
            onSave={handleEdit}
            onCancel={() => setEditingItem(null)}
            saving={saving}
            token={token}
          />
        </div>
      )}

      {/* Specials list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-[#3f2a1d]/10" />
          ))}
        </div>
      ) : specials.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">⭐</p>
          <p className="text-[#3f2a1d]" style={{ fontFamily: "Georgia, serif" }}>
            No specials yet — add your first one above
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {specials.map((item) => (
            <div
              key={item._id}
              className={`flex flex-wrap items-center gap-3 p-4 rounded-xl border transition-all ${
                item.active ? "bg-white border-[#3f2a1d]/10" : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              {/* Thumbnail */}
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#3f2a1d]/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[#f5e8c7] flex items-center justify-center shrink-0 text-xl">
                  ⭐
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-[#3f2a1d] truncate" style={{ fontFamily: "Georgia, serif" }}>
                    {item.title}
                  </p>
                  {item.active ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                  ) : (
                    <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-[#6b5a47] mt-0.5 truncate">{item.description}</p>
                )}
              </div>

              {/* Price + actions: own full-width row on phones, inline from sm+ */}
              <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
                <span className="text-base font-bold text-[#c2410c] shrink-0" style={{ fontFamily: "Georgia, serif" }}>
                  ${Number(item.price).toFixed(2)}
                </span>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleActive(item)}
                    title={item.active ? "Deactivate (hide from home page)" : "Activate (show on home page)"}
                    className="p-2.5 sm:p-1.5 rounded-lg hover:bg-[#f5e8c7] transition-colors text-lg sm:text-sm"
                  >
                    {item.active ? "🟢" : "⭕"}
                  </button>
                  <button
                    onClick={() => { setEditingItem(item); setShowAddForm(false); }}
                    className="p-2.5 sm:p-1.5 rounded-lg hover:bg-[#f5e8c7] transition-colors text-lg sm:text-sm"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeletingItem(item)}
                    className="p-2.5 sm:p-1.5 rounded-lg hover:bg-red-50 transition-colors text-lg sm:text-sm"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-[#f5e8c7] border-2 border-[#3f2a1d] rounded-xl max-w-sm w-full p-6 shadow-xl">
            <p className="text-[#3f2a1d] text-base mb-2 font-semibold" style={{ fontFamily: "Georgia, serif" }}>
              Delete this special?
            </p>
            <p className="text-[#6b5a47] text-sm mb-6" style={{ fontFamily: "Georgia, serif" }}>
              "{deletingItem.title}" will be permanently deleted, including its image from Cloudinary.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2 rounded-full border-2 border-[#3f2a1d] text-[#3f2a1d] text-sm"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 py-2 rounded-full bg-red-600 text-white text-sm disabled:opacity-50"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// MAIN — tabs shell that holds both
// ─────────────────────────────────────────
// WHY defaultTab prop: both /dashboard/gallery and /dashboard/specials render
// this same component, so we let the route tell us which tab to open first.
const GalleryManager = ({ defaultTab = "gallery" }) => {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = [
    { id: "gallery", label: "Gallery", icon: "🖼️" },
    { id: "specials", label: "Specials", icon: "⭐" },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl text-[#3f2a1d]" style={{ fontFamily: "Georgia, serif" }}>
          Gallery & Specials
        </h1>
        <p className="text-sm text-[#6b5a47] mt-1" style={{ fontFamily: "Georgia, serif" }}>
          Manage your photo gallery and today's featured specials
        </p>
      </div>

      {/* Tab switcher */}
      {/* WHY tabs not two separate nav links: gallery + specials share the same
          upload flow and it avoids adding a second nav item just for a related feature */}
      <div className="flex gap-2 mb-6 border-b border-[#3f2a1d]/10 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[#3f2a1d] text-[#f5e8c7]"
                : "text-[#3f2a1d] hover:bg-[#f5e8c7] border border-[#3f2a1d]/20"
            }`}
            style={{ fontFamily: "Georgia, serif" }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active tab content */}
      {activeTab === "gallery" ? (
        <GalleryTab token={token} />
      ) : (
        <SpecialsTab token={token} />
      )}
    </div>
  );
};

export default GalleryManager;
