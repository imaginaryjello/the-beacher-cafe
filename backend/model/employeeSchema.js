// EMployee management system user schema
import mongoose from "mongoose";

const employeeSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ["admin", "coadmin", "employee"],
    default: "employee",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  approvalExpiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  // WHY we store a hashed token instead of the raw one: if the DB were ever
  // compromised, an attacker couldn't use stored tokens to reset passwords.
  // We send the raw token in the email URL, hash it here, compare on reset.
  resetPasswordToken: { type: String, default: null, select: false },
  resetPasswordExpires: { type: Date, default: null },
};

const employee = mongoose.model("Employee", employeeSchema);
export default employee;
