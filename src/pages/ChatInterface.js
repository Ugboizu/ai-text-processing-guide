import React, { useState, useEffect } from "react";
import "../css/ChatInterface.css"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowRight } from '@fortawesome/free-solid-svg-icons';
import Header from "../components/Header";

const ORIGIN_TRIAL_TOKENS = [
  "Aoeg49e8gXziww8aMaciOT3ocfAg14TCdd6srBr0/ENCVaog72otR4Or4Qjz9qByZNGl2mbK/pxvft9j0jf8sw0AAABReyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJmZWF0dXJlIjoiVHJhbnNsYXRpb25BUEkiLCJleHBpcnkiOjE3NTMxNDI0MDB9E",  // Translation API token
  "ApywZEcawPu3bp6OLLTdoGZKtPjN5sKcNOYQ7FrAJbcOp/vfx7SNIZu8Zxj9gqcIPXzkGd5/KiS1HpvUvKee5gwAAABVeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJmZWF0dXJlIjoiQUlTdW1tYXJpemF0aW9uQVBJIiwiZXhwaXJ5IjoxNzUzMTQyNDAwfQ==", // Summarization API token
  "AlvnQOgXEaDkm1KTvW3ZasTnP5EAdLCnhbhfTzwAE2D5V1t2jyJ3+jjnQWgXOtgO40FeJ2rt7V69DIsxHW/7uA4AAABXeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJmZWF0dXJlIjoiTGFuZ3VhZ2VEZXRlY3Rpb25BUEkiLCJleHBpcnkiOjE3NDk1OTk5OTl9" // Language Detection API token
];

const ChatInterface = () => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");


  useEffect(() => {
    // Origin Trial Token here
    ORIGIN_TRIAL_TOKENS.forEach((token) => {
      const metaTag = document.createElement("meta");
      metaTag.httpEquiv = "origin-trial";
      metaTag.content = token;
      document.head.appendChild(metaTag);
    });
  }, []);

  const API_BASE = "http://localhost:3000";

  const handleSend = async () => {
    if (!inputText.trim()) return; 

    setMessages([...messages, { text: inputText, type: "user" }]);

    try {
      // Detect Language
      const detectRes = await fetch(`${API_BASE}/detect`, {
        method: "POST",
        body: JSON.stringify({ text: inputText }),
        headers: { "Content-Type": "application/json" },
      });
  
      if (!detectRes.ok) throw new Error("Language detection failed");

      const detectData = await detectRes.json();
      if (!detectData.language) throw new Error("No language detected");

      const language = detectData.language;
      setMessages((prev) => [...prev, { text: `Detected Language: ${language}`, type: "bot" }]);

      if (language === "en" && inputText.length > 150) {
        setMessages((prev) => [...prev, { text: "Summarize available", type: "bot", summarize: true }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { text: "Error processing request", type: "bot" }]);
    }

    setInputText("");
  };
  
  // Summarize Text
  const handleSummarize = async (text) => {
    try {
      const summarizeRes = await fetch(`${API_BASE}/summarize`, {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
      });
      const summarizeData = await summarizeRes.json();
      setMessages((prev) => [...prev, { text: `Summary: ${summarizeData.summary}`, type: "bot" }]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: "Summarization error", type: "bot" }]);
    }
  };

  // Translation 
  const handleTranslate = async (text) => {

    if (!text) {
      setMessages((prev) => [...prev, { text: "No text to translate", type: "bot", error: true }]);
      return;
    }

    try {
      const translateRes = await fetch(`${API_BASE}/translate`, {
        method: "POST",
        body: JSON.stringify({ text, targetLanguage: selectedLanguage }),
        headers: { "Content-Type": "application/json" },
      });

      if (!translateRes.ok) throw new Error("Translation failed");

      const translateData = await translateRes.json();
      if (!translateData.translation) throw new Error("No translation received");

      setMessages((prev) => [...prev, { text: `Translated: ${translateData.translation}`, type: "bot" }]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: "Translation error", type: "bot", error: true }]);
    }
  };


  return (
    <div>
      <Header />
      <div className="chat-container">
      <div className="chat-output">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.type} ${msg.error ? "error" : ""}`}>
            {msg.text} <br />
            {msg.summarize && <button onClick={() => handleSummarize(msg.text)} className="send-btn">Summarize</button>}
            <div className="translation-controls">
              <select onChange={(e) => setSelectedLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="pt">Portuguese</option>
                <option value="es">Spanish</option>
                <option value="ru">Russian</option>
                <option value="tr">Turkish</option>
                <option value="fr">French</option>
              </select> 
              <button onClick={() => handleTranslate(inputText)} className="send-btn">Translate</button>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <textarea
          placeholder="Type here..." value={inputText} onChange={(e) => setInputText(e.target.value)}
        />
        <button onClick={handleSend} className="send-button"><FontAwesomeIcon icon={faCircleArrowRight} /></button>
      </div>
    </div>
    </div>
    
    
  );
};

export default ChatInterface;
