// backend/routes/user.js
import express from "express";
import bcrypt from "bcryptjs"; // ← ADD THIS
import jwt from "jsonwebtoken"; // ← ADD THIS
import Employee from "../model/employeeSchema.js";
import crypto from "crypto"; // for token regeneration
import Notification from "../model/notificationSchema.js";
import {
  verifyToken,
  requireAdmin,
  requireAccepted,
} from "../middleware/auth.js";
import rateLimit from "express-rate-limit";
import { sendPasswordResetEmail } from "../config/email.js"; // import the email function

const fireNotification = (data) => {
  Notification.create(data).catch((err) =>
    console.error("[Notification] Failed to create:", err.message),
  );
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});
const router = express.Router();

// ============================================
// REGISTER (SIGNUP)
// POST /api/user/register
//
// WHAT CHANGES FROM YOUR VERSION:
//   1. role is forced to "employee" — can't self-assign admin
//   2. status is explicitly set to "pending"
//   3. approvalExpiresAt is set to 3 days from now
//   4. A Notification document is created for the owner
//   5. NO JWT issued on register — employee waits for approval
// ============================================
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    // WHY: We destructure `role` out — we do NOT use it.
    // If someone sends { role: "admin" } in the body, it's ignored.

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // WHY: 3 days in milliseconds = 3 * 24 * 60 * 60 * 1000
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

    const newEmployee = new Employee({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "employee", // SECURITY FIX: always forced, never from req.body
      status: "pending", // LOGIC FIX: always pending on signup
      approvalExpiresAt: new Date(Date.now() + THREE_DAYS), // for cron job cleanup
    });

    await newEmployee.save();

    // WHY: After saving the employee, we create an in-app notification for the owner.
    // We don't await this — if it fails, registration still succeeds.
    // The employee record is what matters; the notification is best-effort.
    Notification.create({
      type: "new_member",
      message: `New signup: ${name} (${email}) is waiting for approval.`,
      relatedId: newEmployee._id,
    }).catch((err) =>
      console.error("Failed to create signup notification:", err),
    );

    // WHY: We deliberately do NOT issue a JWT here.
    // The employee must wait for owner approval, then log in manually.
    // Auto-logging in a pending user would bypass the approval gate.
    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please wait for the owner to approve your account before logging in.",
      employee: {
        id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        // WHY: We return status so the frontend can show the right message
        status: newEmployee.status,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating new member",
    });
  }
});
// ============================================
// LOGIN
// POST /api/user/login
//
// WHAT CHANGES FROM YOUR VERSION:
//   1. status is included in the JWT payload
//   2. status is included in the response user object
//   3. Login is NOT blocked for pending users —
//      the frontend reads the token and decides what to show
// ============================================
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const employeeData = await Employee.findOne({ email }).select("+password"); // WHY: we need the hashed password for comparison

    if (!employeeData) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

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

    // WHY: status is included in the token payload.
    // The frontend decodes this and routes the user to:
    //   - "pending" → waiting screen
    //   - "accepted" → dashboard
    //   - "inactive" → "your account has been deactivated" screen
    // This means no extra API call is needed after login.
    const token = jwt.sign(
      {
        id: employeeData._id,
        role: employeeData.role,
        status: employeeData.status, // NEW: frontend needs this to gate the dashboard
        email: employeeData.email,
      },
      process.env.JWT_SECRET,
      // WHY pin the algorithm: verifyToken only accepts HS256, so state it
      // explicitly here too rather than relying on the library default.
      { expiresIn: "7d", algorithm: "HS256" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: employeeData._id,
        name: employeeData.name,
        email: employeeData.email,
        role: employeeData.role,
        status: employeeData.status, // NEW: return status so frontend can store it
        phone: employeeData.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// ============================================
// GET ALL EMPLOYEES
// GET /api/user/
//
// WHAT CHANGES: Now protected by verifyToken + requireAccepted (implicit via verifyToken)
// WHY: Before, any unauthenticated request could see all employee records.
// ============================================
router.get("/", verifyToken, requireAccepted, async (req, res) => {
  try {
    const employees = await Employee.find().select("-password");

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employees",
    });
  }
});

// ============================================
// Get pending employees for admin approval
// GET /api/user/pending

// owner needs to see the pending list and do the approbal for further processing
// ============================================
router.get("/pending", verifyToken, requireAdmin, async (req, res) => {
  try {
    const pendingEmployees = await Employee.find({
      status: "pending",
    }).select("-password");

    res.status(200).json({
      success: true,
      count: pendingEmployees.length,
      employees: pendingEmployees,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending employees",
    });
  }
});

// ============================================
// approve employee registration
// POST /api/user/approve/:id
// ============================================
router.patch("/approve/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        status: "accepted",
        approvalExpiresAt: null, // WHY: Clear the expiry — they're approved, cron ignores them now
      },
      { new: true }, // WHY: returns the updated document, not the old one
    ).select("-password");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    // Mark related notification as read
    Notification.findOneAndUpdate(
      { relatedId: req.params.id, type: "new_member" },
      { read: true },
    ).catch(() => {}); // silent — don't block the response

    fireNotification({
      type: "member_approved",
      message: `${updated.name} has been approved and joined the team.`,
      relatedId: updated._id,
      triggeredBy: req.user.id,
      visibleTo: "all", //whole team can see the new memeber joined
      metadata: {
        action: "approved",
        employeeName: updated.name,
      },
    });

    res.status(200).json({
      success: true,
      message: `${updated.name} has been approved.`,
      employee: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error approving employee",
    });
  }
});

// ============================================
// REJECT EMPLOYEE (owner only)
// PATCH /api/user/reject/:id
//
// WHY: We delete the document entirely on reject.
// A rejected signup has no use in the DB and
// clutters the pending list.
// ============================================
router.delete("/reject/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    // Clean up the notification too
    Notification.findOneAndDelete({ relatedId: req.params.id }).catch(() => {});

    res.status(200).json({
      success: true,
      message: `${deleted.name}'s signup request has been rejected and removed.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error rejecting employee",
    });
  }
});

// ============================================
// PROMOTE / DEMOTE EMPLOYEE (owner only)
// PATCH /api/user/promote/:id
// Body: { role: "coadmin" } or { role: "employee" }
//
// WHY: Owner can upgrade employee → coadmin (edit rights)
//   or downgrade coadmin → employee (remove edit rights).
//   Only "coadmin" and "employee" are valid targets —
//   you can't promote someone to "admin" (only one owner).
// ============================================
router.patch("/promote/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    // WHY: Validate the target role. Owner cannot be assigned via this route.
    if (!["coadmin", "employee"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be "coadmin" or "employee".',
      });
    }

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    //notification for role change
    fireNotification({
      type: "role_change",
      message: `${updated.name} has been ${role === "coadmin" ? "promoted to Co-Admin" : "changed to Employee"}.`,
      relatedId: updated._id,
      triggeredBy: req.user.id,
      visibleTo: "coadmin", // owner + coadmin see role changes
      metadata: {
        action: "role_change",
        employeeName: updated.name,
        newRole: role,
      },
    });

    res.status(200).json({
      success: true,
      message: `${updated.name} is now a ${role}.`,
      employee: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating role",
    });
  }
});

// ============================================
// DEACTIVATE EMPLOYEE (owner only)
// PATCH /api/user/deactivate/:id
//
// WHY: Different from reject — this is for existing accepted
// employees the owner wants to suspend without deleting.
// Their data stays; they just can't log in to the dashboard.
// ============================================
router.patch("/deactivate/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true },
    ).select("-password");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    fireNotification({
      type: "system",
      message: `${updated.name}'s account has been deactivated.`,
      relatedId: updated._id,
      triggeredBy: req.user.id,
      visibleTo: "owner", // only owner needs to know
      metadata: { action: "deactivated", employeeName: updated.name },
    });

    res.status(200).json({
      success: true,
      message: `${updated.name} has been deactivated.`,
      employee: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deactivating employee",
    });
  }
});

// ============================================
// ============================================
// GET OWN PROFILE
// GET /api/user/profile
// Protected: any accepted employee
// WHY a separate /profile route instead of using GET /:id:
//   - The user already has their own ID in the JWT token
//   - No ID param needed — they can only read their own data
//   - Cleaner API surface with no ID exposure required
// ============================================
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select(
      "-password -resetPasswordToken -resetPasswordExpires",
    );
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }
    res.json({ success: true, employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
});

// ============================================
// UPDATE PROFILE DETAILS
// PATCH /api/user/profile
// Protected: any accepted employee
// Body: { name, phone }
// WHY PATCH not PUT: we only allow updating name and phone.
//   Email changes are not allowed here — email is their identity
//   and changing it would require re-verification (a separate feature).
// ============================================
router.patch("/profile", verifyToken, async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    // WHY check phone uniqueness manually: Mongoose unique constraint throws a
    // cryptic error, so we catch it ourselves and return a clear message
    if (phone) {
      const phoneInUse = await Employee.findOne({
        phone,
        _id: { $ne: req.user.id },
      });
      if (phoneInUse) {
        return res
          .status(400)
          .json({
            success: false,
            message: "That phone number is already in use",
          });
      }
    }

    const updated = await Employee.findByIdAndUpdate(
      req.user.id,
      { name: name.trim(), ...(phone && { phone: phone.trim() }) },
      { new: true },
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, employee: updated, message: "Profile updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
});

// ============================================
// CHANGE PASSWORD (logged in)
// PATCH /api/user/change-password
// Protected: any accepted employee
// Body: { currentPassword, newPassword }
// WHY require currentPassword: confirms it's the real user making the change,
//   not someone who grabbed an unlocked screen or a stolen token
// ============================================
router.patch("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Current and new password are required",
        });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "New password must be at least 6 characters",
        });
    }

    // WHY select("+password"): password is select:false by default so it won't
    // appear in normal queries. We opt-in here because we need it for comparison.
    const employee = await Employee.findById(req.user.id).select("+password");
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, employee.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    employee.password = await bcrypt.hash(newPassword, 10);
    await employee.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error changing password" });
  }
});

// ============================================
// FORGOT PASSWORD
// POST /api/user/forgot-password
// Public (no auth) — rate limited
// Body: { email }
//
// WHY we always return the same response regardless of whether the email exists:
//   Returning a different message for "email found" vs "email not found" lets an
//   attacker enumerate which emails are registered (account enumeration attack).
//   We silently skip sending if the email isn't found.
// ============================================
router.post("/forgot-password", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const employee = await Employee.findOne({
      email: email.toLowerCase().trim(),
    });

    // Always respond with the same message — don't reveal if email exists
    const safeResponse = {
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    };

    if (!employee) {
      return res.json(safeResponse); // exit quietly, no email sent
    }

    // WHY raw token in email, hashed token in DB:
    //   Raw = what we put in the reset URL (user sees this briefly)
    //   Hashed = what we store (useless to an attacker who reads the DB)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    employee.resetPasswordToken = hashedToken;
    employee.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await employee.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(employee.email, {
      name: employee.name,
      resetUrl,
    });

    res.json(safeResponse);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error sending reset email" });
  }
});

// ============================================
// RESET PASSWORD
// POST /api/user/reset-password
// Public (no auth) — rate limited
// Body: { token, newPassword }
//
// WHY we hash the incoming token before querying:
//   We stored the hashed version, so we hash the incoming token to compare —
//   same principle as bcrypt but for the reset token.
// ============================================
router.post("/reset-password", authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Token and new password are required",
        });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters",
        });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // WHY $gt: Date.now(): reject tokens that exist but are expired
    const employee = await Employee.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!employee) {
      return res.status(400).json({
        success: false,
        message:
          "Reset link is invalid or has expired. Please request a new one.",
      });
    }

    employee.password = await bcrypt.hash(newPassword, 10);
    // WHY clear the token after use: single-use link — can't be replayed
    employee.resetPasswordToken = null;
    employee.resetPasswordExpires = null;
    await employee.save();

    res.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error resetting password" });
  }
});

export default router;
