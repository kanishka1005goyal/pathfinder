import { useState } from "react";

import axios from "axios";


// ✅ Use env var so it works in dev AND deployed environments

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/chat";


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

      console.log("📤 Sending to:", API_URL);

      console.log("📦 Payload:", { message: msg, history });


      const res = await axios.post(API_URL, {

        message: msg,

        history,

        resumeText: localStorage.getItem("resumeText"),

      });


      console.log("📥 Response:", res.data);


      setMessages((prev) => [

        ...prev,

        { sender: "bot", text: res.data.reply },

      ]);

    } catch (error) {

      // ✅ ACTUALLY log what's wrong so we can see it

      console.error("❌ Chat error:", error);

      console.error("❌ Error response:", error.response?.data);

      console.error("❌ Error status:", error.response?.status);

      console.error("❌ Error URL:", error.config?.url);


      const detail =

        error.response?.data?.error ||

        error.response?.data?.message ||

        error.message ||

        "Unknown error";


      setMessages((prev) => [

        ...prev,

        {

          sender: "bot",

          text: `⚠️ Error: ${detail}\n(Check browser console for full details)`,

        },

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

            <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>

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