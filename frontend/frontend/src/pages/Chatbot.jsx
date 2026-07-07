import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/chat/";

console.log("API URL:", API_URL);

function Chatbot() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (customMessage = null) => {
    const msg = customMessage || message;
    if (!msg.trim()) return;

    const userMsg = { sender: "user", text: msg };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    const history = updatedMessages.slice(-10).map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      console.log("Sending to:", API_URL);
      const res = await axios.post(API_URL, {
        message: msg,
        history,
        resumeText: localStorage.getItem("resumeText"),
      });
      console.log("Response:", res.data);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: res.data.reply },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      const detail =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `Error: ${detail}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2>PathFinder AI Career Coach</h2>
      <div className="flex gap-2 flex-wrap my-4">
        <button onClick={() => sendMessage("Improve my resume")}>Improve Resume</button>
        <button onClick={() => sendMessage("Generate interview questions based on my resume")}>Interview Questions</button>
        <button onClick={() => sendMessage("Analyze my skill gaps and suggest improvements")}>Skill Gap</button>
        <button onClick={() => sendMessage("Take my mock interview")}>Mock Interview</button>
      </div>
      <div className="border h-96 overflow-y-auto p-3 bg-gray-50">
        {messages.map((msg, index) => (
          <p key={index} className="my-2">
            <b>{msg.sender === "user" ? "You" : "AI"}:</b>{" "}
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </p>
        ))}
        {loading && <p className="text-gray-500">AI is thinking...</p>}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask anything..."
          className="flex-1 border px-2 py-1"
          disabled={loading}
        />
        <button onClick={() => sendMessage()} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default Chatbot;