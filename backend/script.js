// scripts/seedOwner.js
// Run once with: node scripts/seedOwner.js
// Then you can delete it or keep it — it won't run unless you call it manually.

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Employee from "./model/employeeSchema.js";

dotenv.config();

const seedOwner = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected to MongoDB");

  // Check if owner already exists — don't create a duplicate
  const existing = await Employee.findOne({ role: "admin" });
  if (existing) {
    console.log("Owner already exists:", existing.email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("yourpassword123", 10);

  const owner = new Employee({
    name: "Peter Martineau", // ← change this
    email: "owner@beachercafe.com", // ← change this
    phone: "4166993874", // ← change this
    password: hashedPassword,
    role: "admin",
    status: "accepted", // owner is pre-approved — no pending state
    approvalExpiresAt: null,
  });

  await owner.save();
  console.log("Owner created successfully:", owner.email);
  process.exit(0);
};

seedOwner().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
