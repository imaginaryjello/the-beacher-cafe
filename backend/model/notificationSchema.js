// model/notificationSchema.js
import mongoose from "mongoose";

// WHY this model exists:
// When an employee signs up, we create a Notification document.
// The owner's dashboard fetches unread notifications and shows a bell badge.
// This is separate from the Twilio email — both happen in parallel.
const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      // WHY enum: keeps notification types consistent for frontend filtering
      enum: ["new_member", "reservation", "system"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      // e.g. "New employee signup: John Doe (john@email.com) is waiting for approval."
    },

    // WHY: Stores the _id of the related document so the owner can click
    // the notification and go directly to that employee's approval card.
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      // Points to the Employee document for new_member type
      // Points to a Reservation document for reservation type
    },

    read: {
      type: Boolean,
      default: false, // owner marks as read after viewing
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
