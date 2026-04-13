// backend/routes/user.js
import express from "express";
import bcrypt from "bcryptjs"; // ← ADD THIS
import jwt from "jsonwebtoken"; // ← ADD THIS
import employee from "../model/employeeSchema.js";

const router = express.Router();

// ============================================
// REGISTER (SIGNUP)
// POST /api/user/register
// ============================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if employee already exists
    const existingEmployee = await employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new employee
    const newEmployee = new employee({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: "Registration successful",
      employee: {
        id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      // ← CHANGED from 200 to 500
      success: false,
      message: "Error creating new member",
      error: error.message,
    });
  }
});

// ============================================
// LOGIN
// POST /api/user/login
// ============================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find employee by email
    const employeeData = await employee.findOne({ email }); // ← RENAMED from employeeId

    if (!employeeData) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      employeeData.password,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: employeeData._id,
        role: employeeData.role,
        email: employeeData.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }, // Changed from 1h to 7d for better UX
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: employeeData._id,
        name: employeeData.name,
        email: employeeData.email,
        role: employeeData.role,
        phone: employeeData.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      // ← CHANGED from 401 to 500
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
});

// ============================================
// GET ALL EMPLOYEES
// GET /api/user/
// ============================================
router.get("/", async (req, res) => {
  try {
    const employees = await employee.find().select("-password"); // ← Don't send passwords!

    res.status(200).json({
      success: true,
      count: employees.length,
      employees: employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      // ← CHANGED from 401 to 500
      success: false,
      message: "Error fetching employees",
      error: error.message,
    });
  }
});

export default router;
