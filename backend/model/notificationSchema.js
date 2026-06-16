// backend/model/notificationSchema.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "new_member",
        "member_approved",
        "role_change",
        "menu_change",
        "gallery_change",
        "reservation",
        "system",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    // WHO TRIGGERED THIS — employee who did the action
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    // WHO CAN SEE THIS
    // "owner"   → admin only
    // "coadmin" → admin + coadmin
    // "all"     → everyone
    visibleTo: {
      type: String,
      enum: ["owner", "coadmin", "all"],
      default: "owner",
    },
    // PER-USER READ TRACKING
    // unread for me = my _id NOT in this array
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    // EXTRA CONTEXT — flexible object for any additional data
    // e.g. { action: "added", itemName: "Eggs Benedict", price: 16.99 }
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
