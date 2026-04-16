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

// Dashboard (Protected)
import Dashboard from "./pages/Dashboard/Dashboard"; // ← We'll create this folder

// Context
import { AuthProvider } from "./pages/context/AuthContext"; // ← Better to keep context outside 'pages'

// Layouts
import PrivateRoute from "./utils/PrivateRoute"; // ← We'll create this for protection

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - Anyone can access */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/reservations" element={<Reservations />} />

          {/* Auth Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Routes - Only owner & coadmin */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={["owner", "coadmin"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Future Employee Portal */}
          {/* <Route 
            path="/employee-portal" 
            element={
              <PrivateRoute allowedRoles={["employee", "coadmin", "owner"]}>
                <EmployeePortal />
              </PrivateRoute>
            } 
          /> */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
