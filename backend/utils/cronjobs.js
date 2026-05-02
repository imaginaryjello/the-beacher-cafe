// utils/cronJobs.js
// WHY: Run `npm install node-cron` to use this.
// Import and call startCronJobs() once in your server.js / index.js:
//   import { startCronJobs } from "./utils/cronJobs.js";
//   startCronJobs();
import cron from "node-cron";
import Employee from "../model/employeeSchema.js";
import Notification from "../model/notificationSchema.js";

const startCronJobs = () => {
  // WHY "0 0 * * *": This cron expression means "run at 00:00 (midnight) every day".
  // Format: minute hour day-of-month month day-of-week
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Running expired pending account cleanup...");

    try {
      // Find all accounts that are still pending AND whose expiry has passed
      const expiredAccounts = await Employee.find({
        status: "pending",
        approvalExpiresAt: { $lt: new Date() }, // $lt = less than = before now
      });

      if (expiredAccounts.length === 0) {
        console.log("[CRON] No expired pending accounts found.");
        return;
      }

      const expiredIds = expiredAccounts.map((e) => e._id);

      // Delete the expired employee documents
      await Employee.deleteMany({ _id: { $in: expiredIds } });

      // Clean up their notifications
      await Notification.deleteMany({ relatedId: { $in: expiredIds } });

      console.log(
        `[CRON] Deleted ${expiredAccounts.length} expired pending account(s):`,
        expiredAccounts.map((e) => e.email),
      );

      // TODO: Here you can add Twilio email to each expired employee
      // telling them their request window has closed and they need to re-register.
      // for (const emp of expiredAccounts) {
      //   await sendExpiryEmail(emp.email, emp.name);
      // }
    } catch (error) {
      console.error("[CRON] Error during cleanup:", error);
    }
  });

  console.log(
    "[CRON] Jobs registered: expired pending account cleanup (daily midnight)",
  );
};

export { startCronJobs };
