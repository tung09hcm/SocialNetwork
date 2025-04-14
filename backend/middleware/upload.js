import multer from "multer";

const storage = multer.memoryStorage(); // file sẽ được lưu trên RAM để gửi lên cloudinary

export const upload = multer({ storage });
