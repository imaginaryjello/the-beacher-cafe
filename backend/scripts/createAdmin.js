// backend/scripts/createAdmin.js
//
// WHY THIS EXISTS:
// Registration always forces role:"employee" + status:"pending", and approving
// a pending user requires an existing admin. On a fresh production database
// that is a deadlock — nobody can ever reach the dashboard. This script
// creates (or repairs) the first owner account directly.
//
// USAGE (from the backend/ directory):
//   ADMIN_EMAIL=owner@cafe.com ADMIN_PASSWORD='a-long-password' \
//   ADMIN_NAME='Owner Name' ADMIN_PHONE='416-555-0100' \
//   npm run create-admin
//
// WHY env vars and not CLI args: arguments are saved in your shell history,
// environment variables prefixed on one command are not.
//
// Safe to re-run: if the email already exists the account is promoted to an
// accepted admin instead of creating a duplicate. The password is only
// changed when you pass ADMIN_PASSWORD.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Employee from "../model/employeeSchema.js";

dotenv.config();

const { MONGO_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_PHONE } =
  process.env;

const fail = (message) => {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
};

if (!MONGO_URL) fail("MONGO_URL is not set. Check your .env file.");
if (!ADMIN_EMAIL) fail("ADMIN_EMAIL is required.");

const email = ADMIN_EMAIL.toLowerCase().trim();

const run = async () => {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB.");

  const existing = await Employee.findOne({ email });

  if (existing) {
    // Repair path: promote whatever is there into a working owner account.
    existing.role = "admin";
    existing.status = "accepted";
    existing.approvalExpiresAt = null;
    if (ADMIN_PASSWORD) {
      existing.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
      console.log("Password updated.");
    }
    await existing.save();
    console.log(`✔ ${email} is now an accepted admin.`);
    return;
  }

  // Create path — these are required by the schema, so demand them up front.
  if (!ADMIN_PASSWORD) fail("ADMIN_PASSWORD is required to create a new admin.");
  if (ADMIN_PASSWORD.length < 8)
    fail("ADMIN_PASSWORD should be at least 8 characters.");
  if (!ADMIN_NAME) fail("ADMIN_NAME is required to create a new admin.");
  if (!ADMIN_PHONE) fail("ADMIN_PHONE is required to create a new admin.");

  await Employee.create({
    name: ADMIN_NAME.trim(),
    email,
    phone: ADMIN_PHONE.trim(),
    password: await bcrypt.hash(ADMIN_PASSWORD, 10),
    role: "admin",
    status: "accepted",
    approvalExpiresAt: null, // never expires — the cron job ignores accepted users
  });

  console.log(`✔ Admin account created for ${email}. You can now log in.`);
};

run()
  .catch((error) => {
    console.error("\n✖ Failed to create admin:", error.message, "\n");
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
