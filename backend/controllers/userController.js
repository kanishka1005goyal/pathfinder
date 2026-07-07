import User from "../models/User.js";
import Resume from "../models/Resume.js"; // apna actual Resume model path check kar lo

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, location },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getStats = async (req, res) => {
  try {
    // ⚠️ assuming Resume model has a "user" field referencing User._id
    // agar tumhare Resume schema me field ka naam alag hai (e.g. userId, owner) to yahan badal do
    const resumes = await Resume.find({ user: req.userId }).sort({ createdAt: -1 });

    const latestScore = resumes[0]?.atsScore ?? 0;
    const resumeCount = resumes.length;

    const user = await User.findById(req.userId);
    const fields = [user.name, user.email, user.phone, user.location];
    const filled = fields.filter(Boolean).length;
    const profileStrength = Math.round((filled / fields.length) * 100);

    res.json({ latestScore, resumeCount, profileStrength, chatbotSessions: 0 });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};