// backend/model/reservationSchema.js
import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    // NEW: email needed for the confirmation loop
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: { type: String, required: [true, "Phone is required"], trim: true },
    guests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: [1, "At least 1 guest required"],
      max: [20, "For parties over 20, please call us directly"],
    },
    date: { type: String, required: [true, "Date is required"] },
    time: { type: String, required: [true, "Time is required"] },
    notes: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
