// EMployee management system user schema
import mongoose from "mongoose";
import bcrypt from bcrypt;

const employeeSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "co-admin", "employee"],
    default: "employee",
  },
  status: { type: String, enum: ["active", "inactive"], default: "inactive" },
  createdAt: { type: Date, default: Date.now },
};


employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  } 
})
const employee = mongoose.model("Employee", employeeSchema);
export default employee;
