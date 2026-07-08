// src/pages/ResetPassword.jsx
import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ResetPassword = () => {
  // WHY useSearchParams: the reset token arrives as ?token=... in the URL,
  // which is how the email link is built in backend/routes/user.js
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // No token in URL — the link is broken or was tampered with
  if (!token) {
    return (
      <div className="min-h-screen bg-[#f5e8c7] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-[#3f2a1d]/10">
          <div className="text-5xl mb-4">🔗</div>
          <h2
            className="text-xl font-semibold text-[#3f2a1d] mb-3"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Invalid reset link
          </h2>
          <p
            className="text-sm text-[#6b5a47] mb-6"
            style={{ fontFamily: "Georgia, serif" }}
          >
            This link is missing the reset token. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="text-[#c2410c] text-sm underline"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError("Both fields are required");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        // WHY delay before redirect: give them a moment to read the success message
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5e8c7] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-[#3f2a1d]/10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-[Pacifico] text-3xl text-[#3f2a1d]">
            The Beacher Café
          </h1>
          <p
            className="text-sm text-[#6b5a47] mt-1"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Est. 1986
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2
              className="text-xl font-semibold text-[#3f2a1d] mb-3"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Password reset!
            </h2>
            <p
              className="text-sm text-[#6b5a47]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Your password has been updated. Redirecting you to login...
            </p>
          </div>
        ) : (
          <>
            <h2
              className="text-xl font-semibold text-[#3f2a1d] mb-2 text-center"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Set a new password
            </h2>
            <p
              className="text-sm text-[#6b5a47] mb-6 text-center"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Choose a new password for your account.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6b5a47] mb-1">
                  New Password
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 border border-[#3f2a1d]/20 rounded-lg text-sm text-[#3f2a1d] bg-[#fdf8f0] focus:outline-none focus:border-[#c2410c] transition-colors"
                  style={{ fontFamily: "Georgia, serif" }}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6b5a47] mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  className="w-full px-3 py-2 border border-[#3f2a1d]/20 rounded-lg text-sm text-[#3f2a1d] bg-[#fdf8f0] focus:outline-none focus:border-[#c2410c] transition-colors"
                  style={{ fontFamily: "Georgia, serif" }}
                />
              </div>

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
                type="submit"
                disabled={loading}
                className="w-full bg-[#3f2a1d] hover:bg-[#5a3e2b] text-[#f5e8c7] py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <p
              className="text-center text-xs text-[#6b5a47] mt-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <Link to="/forgot-password" className="text-[#c2410c] underline">
                Request a new link
              </Link>
              {" · "}
              <Link to="/login" className="text-[#c2410c] underline">
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
