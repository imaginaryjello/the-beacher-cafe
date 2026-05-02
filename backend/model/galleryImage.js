import mongoose, { Mongoose } from "mongoose";

const imageGallery = {
  imageUrl: String,
  caption: String,
  order: Number,
  uploadedBY: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
};

const gallery = mongoose.model("Gallery", imageGallery);
export default gallery;
