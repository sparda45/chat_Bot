import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; // Use environment variable for the API key
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction:
      "You're Panjul, the best tour guide in Jakarta, using slang like 'gua' and 'lu'. Answer questions about Jakarta's best spots and attractions.",
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to messages array
    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const chatSession = model.startChat({
        generationConfig,
        history: newMessages.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        })),
      });

      const result = await chatSession.sendMessage(input);
      const botMessage = result.response.text();

      setMessages((prev) => [...prev, { role: "model", text: botMessage }]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [...prev, { role: "model", text: "Waduh, gua error nih. Coba lagi ya!" }]);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Jakarta ChatBot - Panjul</h1>
      <div style={{ border: "1px solid #ccc", padding: "10px", maxHeight: "400px", overflowY: "auto" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: "10px 0", textAlign: msg.role === "user" ? "right" : "left" }}>
            <strong>{msg.role === "user" ? "You" : "Panjul"}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: "80%", padding: "10px" }}
          placeholder="Ask Panjul anything about Jakarta..."
        />
        <button onClick={sendMessage} style={{ padding: "10px", marginLeft: "5px" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
