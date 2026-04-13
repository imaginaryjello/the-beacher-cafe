import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./navbar";
import Login from "./login";
import Footer from "./footer";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "employee", // default to employee
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/register",
        formData,
      );

      if (response.data.success) {
        alert("Registration successful! Please log in.");
        navigate("/login");
      } else {
        alert(
          "Registration failed: " + (response.data.message || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
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
              Join The Team
            </h1>
            <p className="text-[#6b5a47] text-lg">
              The Beacher Café • Est. 1986
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-4 border-2 border-[#c2410c] rounded-xl focus:outline-none focus:border-[#9a3410] text-lg"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-4 border-2 border-[#c2410c] rounded-xl focus:outline-none focus:border-[#9a3410] text-lg"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full p-4 border-2 border-[#c2410c] rounded-xl focus:outline-none focus:border-[#9a3410] text-lg"
            />

            <input
              type="password"
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-4 border-2 border-[#c2410c] rounded-xl focus:outline-none focus:border-[#9a3410] text-lg"
            />

            <div>
              <label className="block text-[#3f2a1d] font-medium mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-4 border-2 border-[#c2410c] rounded-xl focus:outline-none focus:border-[#9a3410] text-lg bg-white"
              >
                <option value="employee">Employee (Kitchen / Server)</option>
                <option value="owner">Owner / Admin</option>
              </select>
              <p className="text-xs text-[#6b5a47] mt-2">
                Note: Owner role should only be used by the café owner.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c2410c] hover:bg-[#9a3410] text-white py-4 rounded-2xl font-semibold text-lg transition-all disabled:opacity-70"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-8 text-[#6b5a47]">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-[#c2410c] font-medium cursor-pointer hover:underline"
            >
              Login here
            </span>
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
