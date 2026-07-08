// src/pages/Dashboard/ReservationsList.jsx
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-600",
    completed: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${styles[status] || ""}`}
      style={{ fontFamily: "Georgia, serif" }}
    >
      {status}
    </span>
  );
};

const ReservationsList = () => {
  const { token } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tab, setTab] = useState("all");
  const [error, setError] = useState(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/reservations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setReservations(data.reservations);
      else setError(data.message);
    } catch {
      setError("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const updateStatus = async (id, status) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/reservations/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) await fetchReservations();
      else alert(data.message);
    } catch {
      alert("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  const pending = reservations.filter((r) => r.status === "pending");
  const displayed =
    tab === "all" ? reservations : reservations.filter((r) => r.status === tab);

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-3xl text-[#3f2a1d]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Reservations
        </h1>
        <p
          className="text-sm text-[#6b5a47] mt-1"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {reservations.length} total · {pending.length} pending
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "pending", "confirmed", "cancelled"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${
              tab === t
                ? "bg-[#3f2a1d] text-[#f5e8c7] border-[#3f2a1d]"
                : "border-[#3f2a1d]/30 text-[#3f2a1d] hover:bg-[#f5e8c7]"
            }`}
            style={{ fontFamily: "Georgia, serif" }}
          >
            {t} {t === "pending" && pending.length > 0 && `(${pending.length})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-white rounded-xl animate-pulse border border-[#3f2a1d]/10"
            />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📅</p>
          <p
            className="text-[#3f2a1d]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            No {tab !== "all" ? tab : ""} reservations
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((r) => (
            <div
              key={r._id}
              className="bg-white border border-[#3f2a1d]/10 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3
                      className="text-lg font-semibold text-[#3f2a1d]"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {r.name}
                    </h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <div
                    className="text-sm text-[#6b5a47] space-y-0.5"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    <p>
                      📅 {r.date} at {r.time} · 👥 {r.guests} guests
                    </p>
                    <p>📞 {r.phone}</p>
                    {r.notes && <p className="italic">"{r.notes}"</p>}
                  </div>
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => updateStatus(r._id, "confirmed")}
                      disabled={actionLoading}
                      className="bg-green-600 text-white text-xs px-4 py-2.5 sm:py-2 rounded-full hover:bg-green-700 disabled:opacity-50"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => updateStatus(r._id, "cancelled")}
                      disabled={actionLoading}
                      className="border border-red-500 text-red-500 text-xs px-4 py-2.5 sm:py-2 rounded-full hover:bg-red-50 disabled:opacity-50"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      Decline
                    </button>
                  </div>
                )}
                {r.status === "confirmed" && (
                  <button
                    onClick={() => updateStatus(r._id, "completed")}
                    disabled={actionLoading}
                    className="border border-[#3f2a1d] text-[#3f2a1d] text-xs px-4 py-2.5 sm:py-2 rounded-full hover:bg-[#f5e8c7] disabled:opacity-50 shrink-0"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationsList;
