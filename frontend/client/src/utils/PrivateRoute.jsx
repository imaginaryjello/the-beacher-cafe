// src/utils/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../pages/context/AuthContext";

// ─────────────────────────────────────────
// PENDING SCREEN
// Shown when employee has logged in but
// the owner hasn't approved them yet.
// ─────────────────────────────────────────
const PendingScreen = ({ user, logout }) => (
  <div className="min-h-screen bg-[#f5e8c7] flex items-center justify-center px-4">
    <div className="max-w-md w-full text-center">
      {/* Café logo mark */}
      <div className="w-16 h-16 rounded-full bg-[#3f2a1d] flex items-center justify-center mx-auto mb-6">
        <span className="text-[#f5e8c7] text-2xl">☕</span>
      </div>

      <h1
        className="text-3xl text-[#3f2a1d] mb-3"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Almost there, {user?.name?.split(" ")[0]}
      </h1>

      <div className="w-12 border-t-2 border-[#c2410c] mx-auto mb-5" />

      <p
        className="text-[#5a3e2b] text-base leading-relaxed mb-2"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Your account is waiting for the owner's approval.
      </p>
      <p
        className="text-[#5a3e2b] text-sm leading-relaxed mb-8"
        style={{ fontFamily: "Georgia, serif" }}
      >
        You'll be able to access the dashboard as soon as Peter approves your
        request. This usually happens within the same day — check back soon.
      </p>

      {/* Pending badge */}
      <div className="inline-block bg-[#ede0be] border border-[#c2410c] rounded-full px-5 py-2 mb-8">
        <span
          className="text-[#c2410c] text-sm"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Status: Awaiting Approval
        </span>
      </div>

      <div>
        <button
          onClick={logout}
          className="text-sm text-[#888] underline"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Sign out
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────
// INACTIVE SCREEN
// Shown when an existing employee has been
// deactivated by the owner.
// ─────────────────────────────────────────
const InactiveScreen = ({ logout }) => (
  <div className="min-h-screen bg-[#f5e8c7] flex items-center justify-center px-4">
    <div className="max-w-md w-full text-center">
      <div className="w-16 h-16 rounded-full bg-[#3f2a1d] flex items-center justify-center mx-auto mb-6">
        <span className="text-[#f5e8c7] text-2xl">🔒</span>
      </div>

      <h1
        className="text-3xl text-[#3f2a1d] mb-3"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Account Deactivated
      </h1>

      <div className="w-12 border-t-2 border-[#c2410c] mx-auto mb-5" />

      <p
        className="text-[#5a3e2b] text-base leading-relaxed mb-8"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Your account has been deactivated. Please contact the owner directly if
        you believe this is a mistake.
      </p>

      <div>
        <button
          onClick={logout}
          className="text-sm text-[#888] underline"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Sign out
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────
// PRIVATE ROUTE
// Usage in App.jsx:
//
// All logged-in users (any role):
// <PrivateRoute> <SomePage /> </PrivateRoute>
//
// Owner only:
// <PrivateRoute allowedRoles={["admin"]}> <OwnerPage /> </PrivateRoute>
//
// Co-admin and owner:
// <PrivateRoute allowedRoles={["admin", "coadmin"]}> <EditPage /> </PrivateRoute>
// ─────────────────────────────────────────
const PrivateRoute = ({ children, allowedRoles = null }) => {
  const { user, loading, logout } = useContext(AuthContext);

  // While reading from localStorage, show a simple loader
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5e8c7] flex items-center justify-center">
        <p
          className="text-xl text-[#3f2a1d]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Loading...
        </p>
      </div>
    );
  }

  // Not logged in at all → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // PENDING: logged in but not yet approved by owner
  // FIX: previously there was no check for this — pending users
  // would slip through to the dashboard.
  if (user.status === "pending") {
    return <PendingScreen user={user} logout={logout} />;
  }

  // INACTIVE: owner has deactivated this employee
  if (user.status === "inactive") {
    return <InactiveScreen logout={logout} />;
  }

  // ROLE CHECK: if allowedRoles is specified, verify the user's role
  // FIX 1: Prop was previously named `allwoedRoles` (typo) — now `allowedRoles`
  // FIX 2: Backend stores "admin" not "owner" — roles must match exactly
  // If allowedRoles is null, any accepted user can pass through
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
    // WHY /unauthorized not /login: they ARE logged in, they just
    // don't have permission. Sending them to login is confusing UX.
  }

  // All checks passed — render the protected component
  return children;
};

export default PrivateRoute;
