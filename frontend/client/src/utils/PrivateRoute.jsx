import React, { useContext } from "react";
// import { Navigate, navigate } from "react-router-dom";
import { useNavigate, Link } from "react-router-dom";

import { AuthContext } from "../pages/context/AuthContext";

export const PrivateRoute = ({
  children,
  allwoedRoles = ["admin", "coadmin"],
}) => {
  const { user, loading } = useContext(AuthContext);
  const Navigate = useNavigate();

  //while checking auth status, show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5e8c7] flex items-center justify-center">
        <p className="text-xl text-[#3f2a1d]">Loading...</p>
      </div>
    );
  }

  //if not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  //if user role is not allowed - redirect to login
  if (!allwoedRoles.includes(user.role)) {
    alert("You do not have permission to access this page.");
    return <Navigate to="/login" replace />;
  }

  //if everything is fine, render the children (protected component)
  return children;
};

export default PrivateRoute;
