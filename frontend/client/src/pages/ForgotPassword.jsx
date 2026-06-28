// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        // WHY always show the success screen: the backend never reveals whether
        // the email exists (anti-enumeration). We mirror that here — same UI
        // whether the email was found or not.
        setSubmitted(true);
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

        {submitted ? (
          /* Success state */
          <div className="text-center">
            <div className="text-5xl mb-4">📬</div>
            <h2
              className="text-xl font-semibold text-[#3f2a1d] mb-3"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Check your inbox
            </h2>
            <p
              className="text-sm text-[#6b5a47] mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              If <strong>{email}</strong> is registered, you'll receive a
              password reset link within a few minutes. The link expires in 1
              hour.
            </p>
            <Link
              to="/login"
              className="text-[#c2410c] text-sm underline"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Back to login
            </Link>
          </div>
        ) : (
          /* Email form */
          <>
            <h2
              className="text-xl font-semibold text-[#3f2a1d] mb-2 text-center"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Forgot your password?
            </h2>
            <p
              className="text-sm text-[#6b5a47] mb-6 text-center"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Enter your account email and we'll send you a reset link.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6b5a47] mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-[#3f2a1d]/20 rounded-lg text-sm text-[#3f2a1d] bg-[#fdf8f0] focus:outline-none focus:border-[#c2410c] transition-colors"
                  style={{ fontFamily: "Georgia, serif" }}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3f2a1d] hover:bg-[#5a3e2b] text-[#f5e8c7] py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p
              className="text-center text-xs text-[#6b5a47] mt-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Remember it?{" "}
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

export default ForgotPassword;
