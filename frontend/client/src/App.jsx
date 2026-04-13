import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/home";
import Menu from "./pages/menu";
import About from "./pages/about";
import Reservations from "./pages/reservation";
import Footer from "./pages/footer";
import Register from "./pages/register";
import Login from "./pages/login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Reusing Register for Login */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
