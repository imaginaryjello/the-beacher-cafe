// src/pages/Dashboard/Menueditor.jsx
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CATEGORIES = ["breakfast", "lunch", "dessert", "drinks", "specials"];

const EMPTY_FORM = {
  name: "",
  price: "",
  description: "",
  category: "breakfast",
  isSpecial: false,
  available: true,
  displayOrder: 0,
  imageUrl: "",
};

// ─────────────────────────────────────────
// CATEGORY BADGE
// ─────────────────────────────────────────
const CategoryBadge = ({ category }) => {
  const styles = {
    breakfast: "bg-yellow-100 text-yellow-800",
    lunch: "bg-green-100 text-green-800",
    dessert: "bg-pink-100 text-pink-800",
    drinks: "bg-blue-100 text-blue-800",
    specials: "bg-[#c2410c]/10 text-[#c2410c]",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${styles[category] || "bg-gray-100 text-gray-600"}`}
    >
      {category}
    </span>
  );
};

// ─────────────────────────────────────────
// ITEM FORM (add + edit reuse same component)
// ─────────────────────────────────────────
const ItemForm = ({ initial, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.price === "" || form.price === null) e.price = "Price is required";
    else if (isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = "Price must be a positive number";
    if (!form.category) e.category = "Category is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    onSave({ ...form, price: Number(form.price) });
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm text-[#3f2a1d] bg-[#fdf8f0] focus:outline-none focus:border-[#c2410c] transition-colors ${
      errors[field] ? "border-red-400" : "border-[#3f2a1d]/20"
    }`;

  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-xs font-medium text-[#6b5a47] mb-1">
          Item Name *
        </label>
        <input
          className={inputClass("name")}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Famous Eggs Benedict"
          style={{ fontFamily: "Georgia, serif" }}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* Price + Category row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#6b5a47] mb-1">
            Price ($) *
          </label>
          <input
            className={inputClass("price")}
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="16.99"
          />
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{errors.price}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6b5a47] mb-1">
            Category *
          </label>
          <select
            className={inputClass("category")}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">{errors.category}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-[#6b5a47] mb-1">
          Description
        </label>
        <textarea
          className={inputClass("description")}
          rows={2}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Short description of the dish..."
          style={{ fontFamily: "Georgia, serif", resize: "none" }}
        />
      </div>

      {/* Display order */}
      <div>
        <label className="block text-xs font-medium text-[#6b5a47] mb-1">
          Display Order{" "}
          <span className="text-[#999]">(lower = appears first)</span>
        </label>
        <input
          className={inputClass("displayOrder")}
          type="number"
          min="0"
          value={form.displayOrder}
          onChange={(e) => set("displayOrder", e.target.value)}
        />
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => set("available", e.target.checked)}
            className="accent-[#c2410c]"
          />
          <span
            className="text-sm text-[#3f2a1d]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Available
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isSpecial}
            onChange={(e) => set("isSpecial", e.target.checked)}
            className="accent-[#c2410c]"
          />
          <span
            className="text-sm text-[#3f2a1d]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Mark as Special
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 bg-[#3f2a1d] hover:bg-[#5a3e2b] text-[#f5e8c7] py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {saving ? "Saving..." : initial ? "Save Changes" : "Add Item"}
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
// MENU ITEM ROW
// ─────────────────────────────────────────
const MenuItemRow = ({
  item,
  onEdit,
  onDelete,
  onToggleAvailable,
  loading,
}) => (
  <div
    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
      item.available
        ? "bg-white border-[#3f2a1d]/10"
        : "bg-gray-50 border-gray-200 opacity-60"
    }`}
  >
    {/* Availability dot */}
    <div
      className={`w-2 h-2 rounded-full flex-shrink-0 ${
        item.available ? "bg-green-500" : "bg-gray-400"
      }`}
    />

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p
          className="text-sm font-semibold text-[#3f2a1d] truncate"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {item.name}
        </p>
        <CategoryBadge category={item.category} />
        {item.isSpecial && (
          <span className="text-xs bg-[#c2410c] text-white px-2 py-0.5 rounded-full">
            Special
          </span>
        )}
        {!item.available && (
          <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
            86'd
          </span>
        )}
      </div>
      {item.description && (
        <p className="text-xs text-[#6b5a47] mt-0.5 truncate">
          {item.description}
        </p>
      )}
    </div>

    {/* Price */}
    <span
      className="text-base font-bold text-[#c2410c] flex-shrink-0"
      style={{ fontFamily: "Georgia, serif" }}
    >
      ${Number(item.price).toFixed(2)}
    </span>

    {/* Actions */}
    <div className="flex gap-1 flex-shrink-0">
      <button
        onClick={() => onToggleAvailable(item)}
        disabled={loading}
        title={item.available ? "Mark as unavailable" : "Mark as available"}
        className="p-1.5 rounded-lg hover:bg-[#f5e8c7] transition-colors text-sm disabled:opacity-50"
      >
        {item.available ? "🟢" : "⭕"}
      </button>
      <button
        onClick={() => onEdit(item)}
        disabled={loading}
        className="p-1.5 rounded-lg hover:bg-[#f5e8c7] transition-colors text-sm disabled:opacity-50"
        title="Edit"
      >
        ✏️
      </button>
      <button
        onClick={() => onDelete(item)}
        disabled={loading}
        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-sm disabled:opacity-50"
        title="Delete"
      >
        🗑️
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────
// MAIN MENU EDITOR
// ─────────────────────────────────────────
const MenuEditor = () => {
  const { token } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // item being edited
  const [deletingItem, setDeletingItem] = useState(null); // confirm delete

  // ── FETCH ──
  const fetchItems = async () => {
    try {
      setFetchLoading(true);
      const res = await fetch(`${API}/api/menu`);
      const data = await res.json();
      if (data.success) setItems(data.menuItems);
      else setError(data.message);
    } catch {
      setError("Failed to load menu. Is the server running?");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ── ADD ──
  const handleAdd = async (formData) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/menu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddForm(false);
        await fetchItems();
        showSuccess(`"${data.menuItem.name}" added to the menu.`);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── EDIT ──
  const handleEdit = async (formData) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/menu/${editingItem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setEditingItem(null);
        await fetchItems();
        showSuccess(`"${data.menuItem.name}" updated.`);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE ──
  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/menu/${deletingItem._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDeletingItem(null);
        await fetchItems();
        showSuccess(data.message);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── TOGGLE AVAILABILITY ──
  const handleToggleAvailable = async (item) => {
    try {
      const res = await fetch(`${API}/api/menu/${item._id}/availability`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ available: !item.available }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchItems();
        showSuccess(data.message);
      }
    } catch {
      setError("Network error.");
    }
  };

  // ── FILTER BY TAB ──
  const filtered =
    activeTab === "all" ? items : items.filter((i) => i.category === activeTab);

  const countFor = (cat) => items.filter((i) => i.category === cat).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1
            className="text-3xl text-[#3f2a1d]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Menu Editor
          </h1>
          <p
            className="text-sm text-[#6b5a47] mt-1"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {items.length} items · {items.filter((i) => i.available).length}{" "}
            available
          </p>
        </div>
        {!showAddForm && !editingItem && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#c2410c] hover:bg-[#9a3009] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            + Add Item
          </button>
        )}
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm mb-4">
          ✓ {successMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">
            ×
          </button>
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white border-2 border-[#c2410c]/30 rounded-xl p-6 mb-6 shadow-sm">
          <h2
            className="text-lg font-semibold text-[#3f2a1d] mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Add New Item
          </h2>
          <ItemForm
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
            saving={saving}
          />
        </div>
      )}

      {/* Edit form */}
      {editingItem && (
        <div className="bg-white border-2 border-[#c2410c]/30 rounded-xl p-6 mb-6 shadow-sm">
          <h2
            className="text-lg font-semibold text-[#3f2a1d] mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Editing: {editingItem.name}
          </h2>
          <ItemForm
            initial={{
              name: editingItem.name,
              price: editingItem.price,
              description: editingItem.description || "",
              category: editingItem.category,
              isSpecial: editingItem.isSpecial,
              available: editingItem.available,
              displayOrder: editingItem.displayOrder || 0,
              imageUrl: editingItem.imageUrl || "",
            }}
            onSave={handleEdit}
            onCancel={() => setEditingItem(null)}
            saving={saving}
          />
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {["all", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
              activeTab === cat
                ? "bg-[#3f2a1d] text-[#f5e8c7] border-[#3f2a1d]"
                : "border-[#3f2a1d]/30 text-[#3f2a1d] hover:bg-[#f5e8c7]"
            }`}
            style={{ fontFamily: "Georgia, serif" }}
          >
            {cat === "all"
              ? `All (${items.length})`
              : `${cat} (${countFor(cat)})`}
          </button>
        ))}
      </div>

      {/* Item list */}
      {fetchLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-white rounded-xl animate-pulse border border-[#3f2a1d]/10"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🍽️</p>
          <p
            className="text-[#3f2a1d]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            No items in this category yet
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <MenuItemRow
              key={item._id}
              item={item}
              onEdit={(item) => {
                setEditingItem(item);
                setShowAddForm(false);
              }}
              onDelete={setDeletingItem}
              onToggleAvailable={handleToggleAvailable}
              loading={saving}
            />
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-[#f5e8c7] border-2 border-[#3f2a1d] rounded-xl max-w-sm w-full p-6 shadow-xl">
            <p
              className="text-[#3f2a1d] text-base mb-2 font-semibold"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Remove from menu?
            </p>
            <p
              className="text-[#6b5a47] text-sm mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              "{deletingItem.name}" will be permanently deleted. This cannot be
              undone.
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

export default MenuEditor;
