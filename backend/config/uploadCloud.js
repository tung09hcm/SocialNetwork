import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'backend/uploads'); // Lưu trữ file trong thư mục 'uploads'
  },
  filename: (req, file, cb) => {
    // Đổi tên file theo định dạng 'yyyyMMdd-HHmmss'
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadCloud = multer({ storage: storage });

export { uploadCloud };
