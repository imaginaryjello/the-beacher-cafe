import {v2 as cloudinary} from 'cloudinary';
import { cloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();


// configuring credentials with cloudinary through the env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

//cloudinary storage instead of saving to local storage we will save to cloudinary
const storage = new cloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: (req) => {
            const type = req.query.type || 'general';
            const folders = {
                menu: "beacher-cafe/menu",
                gallery: "beacher-cafe/gallery",
                specials: "beacher-cafe/specials",
                hero: "beacher-cafe/hero",

            }
            return folders[type] || "beacher-cafe/general";

        },
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        //helps to auto-optimize the image thus loading quicker on website

        transformation:[
            {quality: "auto", fetch_format: "auto"},
            {width: 1200, crop: "limit"}, //max width 1200px to ensure faster loading without compromising quality

        ],
    },
}),


//limiting file to 50 mb so that we don't have to worry about large files taking up too much space or bandwidth
//and crashing the server bruh haha

const upload = multer({
    storage,
    limits: {filesize: 5 * 1024 * 1024}, // 5 mb

    filefilter: (req, file, cb) => {
        const allowed= ["image/jpg", "image/png", "image/jpeg", "image/webp"];
        if(allowed.includes(file.mimetype)){
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only JPG, PNG, JPEG and WEBP are allowed."), false);
        }
    },
});

export {cloudinary, upload};