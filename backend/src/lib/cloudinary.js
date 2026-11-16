import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }
  const placeholders = new Set([
    "your_cloud_name",
    "your_api_key",
    "your_api_secret",
  ]);
  return (
    !placeholders.has(CLOUDINARY_CLOUD_NAME) &&
    !placeholders.has(CLOUDINARY_API_KEY) &&
    !placeholders.has(CLOUDINARY_API_SECRET)
  );
};

export default cloudinary;
