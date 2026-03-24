import React, { useState } from "react";
import axios from "axios";
import Navbar from "./navbar";
import Footer from "./footer";

export default function Reservations() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    guests: 2,
    date: "",
    time: "",
    notes: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/reserve", form);
      alert("Reservation confirmed. Check your phone 📩");
    } catch (err) {
      alert("Something went wrong");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f5e8c7] pt-28 px-6">
        <div className="max-w-xl mx-auto bg-white border-4 border-[#3f2a1d] rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-6">
            Reserve a Table
          </h1>

          <p className="text-center text-[#6b5a47] mb-8">
            A seat will be waiting for you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              onChange={handleChange}
              required
              className="w-full p-3 border border-[#c2410c] rounded"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (+1...)"
              onChange={handleChange}
              required
              className="w-full p-3 border border-[#c2410c] rounded"
            />

            <input
              type="number"
              name="guests"
              min="1"
              max="10"
              onChange={handleChange}
              placeholder="Person"
              className="w-full p-3 border border-[#c2410c] rounded"
            />

            <input
              type="date"
              name="date"
              onChange={handleChange}
              required
              className="w-full p-3 border border-[#c2410c] rounded"
            />

            <input
              type="time"
              name="time"
              onChange={handleChange}
              required
              className="w-full p-3 border border-[#c2410c] rounded"
            />

            <textarea
              name="notes"
              placeholder="Special requests (optional)"
              onChange={handleChange}
              className="w-full p-3 border border-[#c2410c] rounded"
            />

            <button
              type="submit"
              className="w-full bg-[#c2410c] text-white py-3 rounded-full font-semibold hover:bg-[#9a3410]"
            >
              Confirm Reservation
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
