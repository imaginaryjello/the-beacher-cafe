import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./navbar";
import Footer from "./footer";
// import { AuthContext } from "../context/AuthContext"; // We'll create this soon

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData,
      );

      if (response.data.success) {
        login(response.data); // Save user + token in context
        alert(`Welcome back, ${response.data.user.name}!`);

        // Redirect based on role
        if (response.data.user.role === "owner") {
          navigate("/dashboard");
        } else {
          navigate("/employee-portal");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f5e8c7] pt-28 px-6 pb-20">
        <div className="max-w-md mx-auto bg-white border-4 border-[#3f2a1d] rounded-3xl p-10 shadow-xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#3f2a1d] mb-2">
              Welcome Back
            </h1>
            <p className="text-[#6b5a47] text-lg">
              The Beacher Café • Est. 1986
            </p>
            <div className="h-1 w-16 bg-[#c2410c] mx-auto mt-6"></div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-4 border-2 border-[#c2410c] rounded-2xl focus:outline-none focus:border-[#9a3410] text-lg"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-4 border-2 border-[#c2410c] rounded-2xl focus:outline-none focus:border-[#9a3410] text-lg"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c2410c] hover:bg-[#9a3410] disabled:bg-[#c2410c]/70 text-white py-4 rounded-2xl font-semibold text-lg transition-all mt-4"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-[#6b5a47]">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#c2410c] font-medium hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>

          {/* Decorative element */}
          <div className="text-center mt-12 text-[#c2410c] text-sm tracking-widest">
            "A table is always ready for you"
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
