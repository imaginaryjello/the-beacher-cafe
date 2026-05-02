// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

// Public Pages
import Home from "./pages/home";
import Menu from "./pages/menu";
import About from "./pages/about";
import Reservations from "./pages/reservation";

// Auth Pages
import Register from "./pages/register";
import Login from "./pages/login";

// Dashboard + Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import Members from "./pages/Dashboard/Members";
// import MenuEditor from "./pages/Dashboard/MenuEditor";     // next step
// import SpecialsEditor from "./pages/Dashboard/SpecialsEditor";
// import GalleryManager from "./pages/Dashboard/GalleryManager";
// import ReservationsList from "./pages/Dashboard/ReservationsList";

// Placeholder for unbuilt pages
const ComingSoon = ({ page }) => (
  <div className="flex flex-col items-center justify-center h-64">
    <p className="text-4xl mb-4">🚧</p>
    <p
      className="text-xl text-[#3f2a1d]"
      style={{ fontFamily: "Georgia, serif" }}
    >
      {page} — coming soon
    </p>
  </div>
);

// Context + Guards
import { AuthProvider } from "./pages/context/AuthContext";
import PrivateRoute from "./utils/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* DASHBOARD — nested routes so sidebar stays mounted */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={["admin", "coadmin", "employee"]}>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route index element={<ComingSoon page="Dashboard Home" />} />
            <Route path="members" element={<Members />} />
            <Route path="menu" element={<ComingSoon page="Menu Editor" />} />
            <Route
              path="specials"
              element={<ComingSoon page="Specials Editor" />}
            />
            <Route
              path="gallery"
              element={<ComingSoon page="Gallery Manager" />}
            />
            <Route
              path="reservations"
              element={<ComingSoon page="Reservations" />}
            />
          </Route>

          {/* UNAUTHORIZED */}
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen bg-[#f5e8c7] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-5xl mb-4">🔒</p>
                  <p
                    className="text-2xl text-[#3f2a1d] mb-4"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    You don't have permission to view this page.
                  </p>
                  <a
                    href="/"
                    className="text-[#c2410c] underline"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Go back home
                  </a>
                </div>
              </div>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-[#f5e8c7] flex items-center justify-center">
                <p
                  className="text-2xl text-[#3f2a1d]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Page not found.
                </p>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
