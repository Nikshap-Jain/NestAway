// routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../cloudSetup/multerConfig");
const { uploadToCloudinary } = require("../cloudSetup/cloudinaryUpload");

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const options = {
      folder: "Nestaway",
      resource_type: "auto", // auto-detect whether image or video
      public_id: `${Date.now()}-${req.file.originalname.split(".")[0]}`, // unique name
    };

    const result = await uploadToCloudinary(req.file.buffer, options);

    return res.status(200).json({
      message: "Upload successful",
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
      },
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return res.status(500).json({
      message: "Failed to upload file",
      error: error.message,
    });
  }
});

// For handling multiple files
router.post("/upload-multiple", upload.array("files", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadPromises = req.files.map((file) => {
      const options = {
        folder: "Nestaway",
        resource_type: "auto",
        public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
      };
      return uploadToCloudinary(file.buffer, options);
    });

    const results = await Promise.all(uploadPromises);

    return res.status(200).json({
      message: "Upload successful",
      data: results.map((result) => ({
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
      })),
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return res.status(500).json({
      message: "Failed to upload files",
      error: error.message,
    });
  }
});

module.exports = router;
