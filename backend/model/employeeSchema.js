// EMployee management system user schema
import mongoose from "mongoose";

const employeeSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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
};

const employee = mongoose.model("Employee", employeeSchema);
export default employee;
