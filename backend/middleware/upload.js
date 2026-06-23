import { useState, useRef } from "react";
import axios from "axios";

export default function UploadTab() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [atsResult, setAtsResult] = useState(null);  // ✅ add this
  const [resumeId, setResumeId] = useState(null);    // ✅ add this
  const inputRef = useRef(null);

  // ... rest of your existing UploadTab code
  // replace startUpload with the axios version