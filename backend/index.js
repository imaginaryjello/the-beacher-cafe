import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";

import router from "./routes/user.js";
import menuRouter from "./routes/menu.js";
import upload from "./routes/upload.js";
import reservationRouter from "./routes/reservations.js";
import settingsRouter from "./routes/settings.js";
import galleryRouter from "./routes/gallery.js";
import specialsRouter from "./routes/specials.js";

import notificationRouter from "./routes/notifications.js";

import { startCronJobs } from "./utils/cronjobs.js";

dotenv.config();

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors());

const MONGO_URL = process.env.MONGO_URL;
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

startCronJobs(); // call this after mongoose connects
app.use("/api", router);
app.use("/api/menu", menuRouter);
app.use("/api/upload", upload);
app.use("/api/notifications", notificationRouter);
app.use("/api/reservations", reservationRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/specials", specialsRouter);
