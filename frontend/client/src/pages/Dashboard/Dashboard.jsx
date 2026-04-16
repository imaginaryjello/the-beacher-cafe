import React from "react";
import { Outlet } from "react-router-dom"; // This will render child pages
import Navbar from "..//../pages/navbar"; // Reuse your existing navbar if you want

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#f5e8c7] flex">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-[#3f2a1d] shadow-lg fixed h-full">
        <div className="p-6 border-b border-[#3f2a1d]">
          <h1 className="font-[Pacifico] text-3xl text-[#3f2a1d]">
            The Beacher Café
          </h1>
          <p className="text-sm text-[#6b5a47] mt-1">Owner Dashboard</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <a
                href="/dashboard"
                className="block p-3 rounded-xl hover:bg-[#f5e8c7] text-[#3f2a1d] font-medium"
              >
                🏠 Dashboard Home
              </a>
            </li>
            <li>
              <a
                href="/dashboard/menu"
                className="block p-3 rounded-xl hover:bg-[#f5e8c7] text-[#3f2a1d] font-medium"
              >
                📋 Menu Editor
              </a>
            </li>
            <li>
              <a
                href="/dashboard/specials"
                className="block p-3 rounded-xl hover:bg-[#f5e8c7] text-[#3f2a1d] font-medium"
              >
                ⭐ Specials Editor
              </a>
            </li>
            <li>
              <a
                href="/dashboard/gallery"
                className="block p-3 rounded-xl hover:bg-[#f5e8c7] text-[#3f2a1d] font-medium"
              >
                🖼️ Gallery Manager
              </a>
            </li>
            <li>
              <a
                href="/dashboard/reservations"
                className="block p-3 rounded-xl hover:bg-[#f5e8c7] text-[#3f2a1d] font-medium"
              >
                📬 Reservations
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-72">
        {/* Top Bar */}
        <div className="bg-white border-b border-[#3f2a1d] px-8 py-5 flex justify-between items-center shadow-sm">
          <h2 className="text-2xl font-semibold text-[#3f2a1d]">Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="text-[#6b5a47]">Welcome back, Peter</span>
            <button
              onClick={() => {
                /* logout logic */
              }}
              className="bg-red-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Page Content Goes Here */}
        <div className="p-8">
          <Outlet /> {/* This is where Specials, Gallery, etc. will render */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
