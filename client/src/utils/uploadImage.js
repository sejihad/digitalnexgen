import axios from "axios";

const uploadFile = async (file) => {
  if (!file) return null;

  const isVideo = file.type.startsWith("video/");
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  let cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_URL;

  if (isVideo) {
    cloudinaryUrl = cloudinaryUrl.replace("/image/upload", "/video/upload");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await axios.post(cloudinaryUrl, formData);
    return response.data.secure_url;
  } catch (error) {
    console.error(
      "Cloudinary upload error:",
      error.response ? error.response.data : error.message
    );
    throw new Error("File upload failed");
  }
};

export default uploadFile;
