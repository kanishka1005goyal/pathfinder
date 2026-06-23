import User from "../models/User.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Uncomment when auth middleware is added
    // await User.findByIdAndUpdate(req.user.id, {
    //   resumePath: req.file.path,
    //   resumeName: req.file.originalname,
    // });

    res.json({ message: "Resume uploaded successfully", file: req.file });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};