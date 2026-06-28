// src/pages/Dashboard/Profile.jsx
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─────────────────────────────────────────
// ROLE BADGE
// ─────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    admin: "bg-[#3f2a1d] text-[#f5e8c7]",
    coadmin: "bg-[#c2410c] text-white",
    employee: "bg-[#f5e8c7] text-[#3f2a1d] border border-[#3f2a1d]/30",
  };
  const labels = { admin: "Owner", coadmin: "Co-Admin", employee: "Employee" };
  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-medium ${styles[role] || styles.employee}`}
      style={{ fontFamily: "Georgia, serif" }}
    >
      {labels[role] || role}
    </span>
  );
};

// ─────────────────────────────────────────
// EDIT DETAILS SECTION
// ─────────────────────────────────────────
const EditDetailsSection = ({ user, token, onSaved }) => {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        // WHY call onSaved: parent needs to sync the new name into AuthContext
        // so the sidebar avatar letter and name update without a page reload
        onSaved({ name: data.employee.name, phone: data.employee.phone });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-[#3f2a1d]/20 rounded-lg text-sm text-[#3f2a1d] bg-[#fdf8f0] focus:outline-none focus:border-[#c2410c] transition-colors";

  return (
    <div className="bg-white rounded-xl border border-[#3f2a1d]/10 p-6 shadow-sm">
      <h2
        className="text-lg font-semibold text-[#3f2a1d] mb-1"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Personal Details
      </h2>
      <p
        className="text-xs text-[#6b5a47] mb-5"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Your name and phone number. Email cannot be changed here.
      </p>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-2.5 text-sm mb-4">
          ✓ Profile updated
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#6b5a47] mb-1">
            Full Name
          </label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{ fontFamily: "Georgia, serif" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6b5a47] mb-1">
            Phone
          </label>
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your phone number"
            style={{ fontFamily: "Georgia, serif" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6b5a47] mb-1">
            Email
          </label>
          {/* WHY disabled: email is the login identity. Changing it would require
              re-verification and a separate security flow — out of scope for now. */}
          <input
            className={`${inputClass} opacity-50 cursor-not-allowed`}
            value={user?.email || ""}
            disabled
            style={{ fontFamily: "Georgia, serif" }}
          />
          <p className="text-xs text-[#999] mt-1">
            Email cannot be changed. Contact the owner if needed.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#3f2a1d] hover:bg-[#5a3e2b] text-[#f5e8c7] py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// CHANGE PASSWORD SECTION
// ─────────────────────────────────────────
const ChangePasswordSection = ({ token }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleChange = async () => {
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from your current one");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-[#3f2a1d]/20 rounded-lg text-sm text-[#3f2a1d] bg-[#fdf8f0] focus:outline-none focus:border-[#c2410c] transition-colors";

  return (
    <div className="bg-white rounded-xl border border-[#3f2a1d]/10 p-6 shadow-sm">
      <h2
        className="text-lg font-semibold text-[#3f2a1d] mb-1"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Change Password
      </h2>
      <p
        className="text-xs text-[#6b5a47] mb-5"
        style={{ fontFamily: "Georgia, serif" }}
      >
        You must enter your current password to set a new one.
      </p>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-2.5 text-sm mb-4">
          ✓ Password changed. You'll use the new password on your next login.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#6b5a47] mb-1">
            Current Password
          </label>
          <input
            className={inputClass}
            type={showPasswords ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Your current password"
            style={{ fontFamily: "Georgia, serif" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6b5a47] mb-1">
            New Password
          </label>
          <input
            className={inputClass}
            type={showPasswords ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            style={{ fontFamily: "Georgia, serif" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6b5a47] mb-1">
            Confirm New Password
          </label>
          <input
            className={inputClass}
            type={showPasswords ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            style={{ fontFamily: "Georgia, serif" }}
          />
        </div>

        {/* Show/hide toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
            className="accent-[#c2410c]"
          />
          <span
            className="text-xs text-[#6b5a47]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Show passwords
          </span>
        </label>

        <button
          onClick={handleChange}
          disabled={saving}
          className="w-full bg-[#c2410c] hover:bg-[#9a3009] text-white py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {saving ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// MAIN PROFILE PAGE
// ─────────────────────────────────────────
const Profile = () => {
  const { user, token, updateUser } = useContext(AuthContext);

  // Sync saved name/phone back into AuthContext + localStorage
  const handleProfileSaved = ({ name, phone }) => {
    updateUser({ name, phone });
  };

  return (
    <div className="max-w-2xl">
      {/* Header — avatar + name + role */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 rounded-full bg-[#3f2a1d] flex items-center justify-center shrink-0 shadow-md">
          <span className="text-[#f5e8c7] text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1
            className="text-2xl text-[#3f2a1d] font-semibold"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {user?.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <RoleBadge role={user?.role} />
            <span
              className="text-xs text-[#6b5a47]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {user?.email}
            </span>
          </div>
        </div>
      </div>

      {/* Two sections stacked */}
      <div className="space-y-6">
        <EditDetailsSection
          user={user}
          token={token}
          onSaved={handleProfileSaved}
        />
        <ChangePasswordSection token={token} />
      </div>
    </div>
  );
};

export default Profile;
