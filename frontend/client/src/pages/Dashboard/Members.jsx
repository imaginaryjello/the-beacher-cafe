// src/pages/Dashboard/Members.jsx
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// ─────────────────────────────────────────
// ROLE BADGE
// Visual indicator for each employee's role
// ─────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    admin: "bg-[#3f2a1d] text-[#f5e8c7]",
    coadmin: "bg-[#c2410c] text-[#f5e8c7]",
    employee: "bg-[#ede0be] text-[#3f2a1d] border border-[#c2410c]",
  };
  const labels = {
    admin: "Owner",
    coadmin: "Co-Admin",
    employee: "Employee",
  };
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
// STATUS BADGE
// ─────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    accepted: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    inactive: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-medium ${styles[status] || ""}`}
      style={{ fontFamily: "Georgia, serif" }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ─────────────────────────────────────────
// PROFILE MODAL
// Any member can view another member's profile
// ─────────────────────────────────────────
const ProfileModal = ({ employee, onClose }) => {
  if (!employee) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-[#f5e8c7] border-2 border-[#3f2a1d] rounded-lg max-w-sm w-full p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#3f2a1d] text-xl font-bold"
        >
          ×
        </button>

        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-[#3f2a1d] flex items-center justify-center mx-auto mb-4">
          <span className="text-[#f5e8c7] text-2xl font-bold">
            {employee.name?.charAt(0).toUpperCase()}
          </span>
        </div>

        <h2
          className="text-xl text-[#3f2a1d] text-center mb-1"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {employee.name}
        </h2>

        <div className="flex justify-center gap-2 mb-5">
          <RoleBadge role={employee.role} />
          <StatusBadge status={employee.status} />
        </div>

        <div
          className="space-y-3 text-sm text-[#3f2a1d]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <div className="flex justify-between border-b border-[#c2410c]/30 pb-2">
            <span className="text-[#6b5a47]">Email</span>
            <span>{employee.email}</span>
          </div>
          <div className="flex justify-between border-b border-[#c2410c]/30 pb-2">
            <span className="text-[#6b5a47]">Phone</span>
            <span>{employee.phone}</span>
          </div>
          <div className="flex justify-between border-b border-[#c2410c]/30 pb-2">
            <span className="text-[#6b5a47]">Member since</span>
            <span>{new Date(employee.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6b5a47]">Role</span>
            <RoleBadge role={employee.role} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// CONFIRM MODAL
// Used for destructive actions (reject, deactivate)
// ─────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
    <div className="bg-[#f5e8c7] border-2 border-[#3f2a1d] rounded-lg max-w-sm w-full p-6 shadow-xl">
      <p
        className="text-[#3f2a1d] text-base mb-6 text-center leading-relaxed"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {message}
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onCancel}
          className="px-5 py-2 rounded-full border-2 border-[#3f2a1d] text-[#3f2a1d] text-sm"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-5 py-2 rounded-full bg-red-600 text-white text-sm border-2 border-red-800"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────
// EMPLOYEE CARD
// ─────────────────────────────────────────
const EmployeeCard = ({
  emp,
  currentUser,
  onView,
  onApprove,
  onReject,
  onPromote,
  onDemote,
  onDeactivate,
  loading,
}) => {
  const isOwner = currentUser?.role === "admin";
  const isSelf = currentUser?.id === emp._id;

  return (
    <div className="bg-white border border-[#3f2a1d]/20 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        {/* Left: avatar + info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-[#3f2a1d] flex items-center justify-center flex-shrink-0">
            <span className="text-[#f5e8c7] font-bold text-lg">
              {emp.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p
              className="text-[#3f2a1d] font-semibold truncate"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {emp.name}{" "}
              {isSelf && <span className="text-xs text-[#c2410c]">(you)</span>}
            </p>
            <p className="text-xs text-[#6b5a47] truncate">{emp.email}</p>
          </div>
        </div>

        {/* Right: badges */}
        <div className="flex flex-col gap-1 items-end flex-shrink-0">
          <RoleBadge role={emp.role} />
          <StatusBadge status={emp.status} />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {/* View profile — everyone can do this */}
        <button
          onClick={() => onView(emp)}
          className="text-xs px-3 py-1.5 rounded-full border border-[#3f2a1d] text-[#3f2a1d] hover:bg-[#f5e8c7] transition-colors"
          style={{ fontFamily: "Georgia, serif" }}
        >
          View Profile
        </button>

        {/* OWNER-ONLY ACTIONS */}
        {isOwner && !isSelf && (
          <>
            {/* Pending: approve or reject */}
            {emp.status === "pending" && (
              <>
                <button
                  onClick={() => onApprove(emp)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Approve
                </button>
                <button
                  onClick={() => onReject(emp)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Reject
                </button>
              </>
            )}

            {/* Accepted employee: promote or deactivate */}
            {emp.status === "accepted" && emp.role === "employee" && (
              <>
                <button
                  onClick={() => onPromote(emp)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full bg-[#c2410c] text-white hover:bg-[#9a3009] transition-colors disabled:opacity-50"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Make Co-Admin
                </button>
                <button
                  onClick={() => onDeactivate(emp)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-400 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Deactivate
                </button>
              </>
            )}

            {/* Co-admin: demote back to employee */}
            {emp.status === "accepted" && emp.role === "coadmin" && (
              <>
                <button
                  onClick={() => onDemote(emp)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#c2410c] text-[#c2410c] hover:bg-[#f5e8c7] transition-colors disabled:opacity-50"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Demote to Employee
                </button>
                <button
                  onClick={() => onDeactivate(emp)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-400 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Deactivate
                </button>
              </>
            )}

            {/* Inactive: reactivate */}
            {emp.status === "inactive" && (
              <button
                onClick={() => onApprove(emp)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Reactivate
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// MAIN MEMBERS PAGE
// ─────────────────────────────────────────
const Members = () => {
  const { user, token } = useContext(AuthContext);

  const [employees, setEmployees] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [viewingProfile, setViewingProfile] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  // confirmAction shape: { message, onConfirm }

  // Active tab: "all" | "pending"
  const [tab, setTab] = useState("all");

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ── FETCH ALL EMPLOYEES ──
  const fetchEmployees = async () => {
    try {
      setFetchLoading(true);
      const res = await fetch(`${API}/api/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to load members. Is the server running?");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ── GENERIC API CALL ──
  const apiCall = async (method, endpoint, body = null) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : null,
      });
      const data = await res.json();
      if (data.success) {
        await fetchEmployees(); // refresh list after any action
      } else {
        alert(data.message || "Something went wrong.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── OWNER ACTIONS ──
  const handleApprove = (emp) => {
    setConfirmAction({
      message: `Approve ${emp.name} and grant them dashboard access?`,
      onConfirm: () => {
        setConfirmAction(null);
        apiCall("PATCH", `/api/approve/${emp._id}`);
      },
    });
  };

  const handleReject = (emp) => {
    setConfirmAction({
      message: `Reject and permanently delete ${emp.name}'s signup request?`,
      onConfirm: () => {
        setConfirmAction(null);
        apiCall("DELETE", `/api/reject/${emp._id}`);
      },
    });
  };

  const handlePromote = (emp) => {
    setConfirmAction({
      message: `Promote ${emp.name} to Co-Admin? They will be able to edit menus and gallery.`,
      onConfirm: () => {
        setConfirmAction(null);
        apiCall("PATCH", `/api/promote/${emp._id}`, { role: "coadmin" });
      },
    });
  };

  const handleDemote = (emp) => {
    setConfirmAction({
      message: `Demote ${emp.name} back to Employee? They will lose edit access.`,
      onConfirm: () => {
        setConfirmAction(null);
        apiCall("PATCH", `/api/promote/${emp._id}`, { role: "employee" });
      },
    });
  };

  const handleDeactivate = (emp) => {
    setConfirmAction({
      message: `Deactivate ${emp.name}? They will be locked out of the dashboard.`,
      onConfirm: () => {
        setConfirmAction(null);
        apiCall("PATCH", `/api/deactivate/${emp._id}`);
      },
    });
  };

  // ── FILTER BY TAB ──
  const pendingEmployees = employees.filter((e) => e.status === "pending");
  const displayedEmployees = tab === "pending" ? pendingEmployees : employees;

  // ── RENDER ──
  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1
          className="text-3xl text-[#3f2a1d] mb-1"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Team Members
        </h1>
        <p
          className="text-sm text-[#6b5a47]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Est. 1986 · {employees.length} member
          {employees.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("all")}
          className={`px-5 py-2 rounded-full text-sm border-2 transition-colors ${
            tab === "all"
              ? "bg-[#3f2a1d] text-[#f5e8c7] border-[#3f2a1d]"
              : "border-[#3f2a1d] text-[#3f2a1d] hover:bg-[#f5e8c7]"
          }`}
          style={{ fontFamily: "Georgia, serif" }}
        >
          All Members
        </button>
        <button
          onClick={() => setTab("pending")}
          className={`px-5 py-2 rounded-full text-sm border-2 transition-colors flex items-center gap-2 ${
            tab === "pending"
              ? "bg-[#c2410c] text-white border-[#c2410c]"
              : "border-[#c2410c] text-[#c2410c] hover:bg-[#f5e8c7]"
          }`}
          style={{ fontFamily: "Georgia, serif" }}
        >
          Pending Approvals
          {pendingEmployees.length > 0 && (
            <span className="bg-white text-[#c2410c] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {pendingEmployees.length}
            </span>
          )}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {fetchLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-5 border border-[#3f2a1d]/20 animate-pulse"
            >
              <div className="flex gap-3">
                <div className="w-11 h-11 bg-[#ede0be] rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#ede0be] rounded w-3/4" />
                  <div className="h-3 bg-[#ede0be] rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayedEmployees.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">☕</p>
          <p
            className="text-[#3f2a1d] text-lg"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {tab === "pending" ? "No pending approvals" : "No members found"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedEmployees.map((emp) => (
            <EmployeeCard
              key={emp._id}
              emp={emp}
              currentUser={user}
              onView={setViewingProfile}
              onApprove={handleApprove}
              onReject={handleReject}
              onPromote={handlePromote}
              onDemote={handleDemote}
              onDeactivate={handleDeactivate}
              loading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {viewingProfile && (
        <ProfileModal
          employee={viewingProfile}
          onClose={() => setViewingProfile(null)}
        />
      )}
      {confirmAction && (
        <ConfirmModal
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default Members;
