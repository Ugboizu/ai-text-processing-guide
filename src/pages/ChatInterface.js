import React, { useState, useEffect } from "react";
import "../css/ChatInterface.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
import Header from "../components/Header";

const ChatInterface = () => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);

  const TRANSLATE_TOKEN = process.env.REACT_APP_TRANSLATE_TOKEN;
  const DETECT_TOKEN = process.env.REACT_APP_DETECT_TOKEN;
  const SUMMARIZE_TOKEN = process.env.REACT_APP_SUMMARIZE_TOKEN;

  const BASE_URL = "https://localhost:3000"; 
  const DETECT_ENDPOINT = `${BASE_URL}/language/detect`;
  const SUMMARIZE_ENDPOINT = `${BASE_URL}/summarize`;
  const TRANSLATE_ENDPOINT = `${BASE_URL}/translate`;

  const languages = [
    { code: "en", name: "English" },
    { code: "pt", name: "Portuguese" },
    { code: "es", name: "Spanish" },
    { code: "ru", name: "Russian" },
    { code: "tr", name: "Turkish" },
    { code: "fr", name: "French" },
  ];

  useEffect(() => {
    const missingTokens = [];
    if (!DETECT_TOKEN) missingTokens.push("Language Detection");
    if (!SUMMARIZE_TOKEN) missingTokens.push("Summarization");
    if (!TRANSLATE_TOKEN) missingTokens.push("Translation");

    if (missingTokens.length > 0) {
      console.warn(`Missing API tokens for: ${missingTokens.join(", ")}. Add them to .env`);
      setMessages((prev) => [
        ...prev,
        {
          text: `Missing API tokens for: ${missingTokens.join(", ")}. Please configure the application.`,
          type: "bot",
          error: true,
        },
      ]);
    }
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) {
      setMessages((prev) => [
        ...prev,
        { text: "Please enter some text!", type: "bot", error: true },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { text: inputText, type: "user" }]);
    setIsLoading(true);

    try {
      // Language Detection API call
      const detectResponse = await fetch(DETECT_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${DETECT_TOKEN}`, 
          "Content-Type": "application/json",
          "Origin-Trial": DETECT_TOKEN, 
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!detectResponse.ok) throw new Error("Language detection failed");
      const detectData = await detectResponse.json();
      const language = detectData.language || "Unknown";

      setMessages((prev) => [
        ...prev,
        { text: `Detected Language: ${language}`, type: "bot" },
      ]);

      // Offer summarization for long English texts
      if (language === "en" && inputText.length > 150) {
        setMessages((prev) => [
          ...prev,
          {
            text: "Summarize available",
            type: "bot",
            summarize: true,
            originalText: inputText,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: `Error detecting language: ${error.message}`, type: "bot", error: true },
      ]);
      console.error("Language Detection Error:", error);
    } finally {
      setIsLoading(false);
      setInputText("");
    }
  };

  const handleSummarize = async (text) => {
    setIsLoading(true);
    try {
      const summarizeResponse = await fetch(SUMMARIZE_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SUMMARIZE_TOKEN}`, 
          "Content-Type": "application/json",
          "Origin-Trial": SUMMARIZE_TOKEN, 
        },
        body: JSON.stringify({ text }),
      });

      if (!summarizeResponse.ok) throw new Error("Summarization failed");
      const summarizeData = await summarizeResponse.json();
      setMessages((prev) => [
        ...prev,
        { text: `Summary: ${summarizeData.summary}`, type: "bot" },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: `Summarization error: ${error.message}`, type: "bot", error: true },
      ]);
      console.error("Summarization Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.type === "user" && msg.text);
    const textToTranslate = lastUserMessage ? lastUserMessage.text : inputText;

    if (!textToTranslate) {
      setMessages((prev) => [
        ...prev,
        { text: "No text to translate", type: "bot", error: true },
      ]);
      return;
    }

    setIsLoading(true);
    try {
      const translateResponse = await fetch(TRANSLATE_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${TRANSLATE_TOKEN}`,
          "Content-Type": "application/json",
          "Origin-Trial": TRANSLATE_TOKEN, 
        },
        body: JSON.stringify({
          text: textToTranslate,
          targetLanguage: selectedLanguage,
        }),
      });

      if (!translateResponse.ok) throw new Error("Translation failed");
      const translateData = await translateResponse.json();
      setMessages((prev) => [
        ...prev,
        { text: `Translated: ${translateData.translation}`, type: "bot" },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: `Translation error: ${error.message}`, type: "bot", error: true },
      ]);
      console.error("Translation Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="chat-container">
        <div className="chat-output" role="log" aria-live="polite">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.type} ${msg.error ? "error" : ""}`}
            >
              {msg.text} <br />
              {msg.summarize && (
                <button
                  onClick={() => handleSummarize(msg.originalText)}
                  className="send-btn"
                  disabled={isLoading}
                >
                  Summarize
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="translation-controls">
          <select
            onChange={(e) => setSelectedLanguage(e.target.value)}
            value={selectedLanguage}
            aria-label="Select language for translation"
            disabled={isLoading}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <button onClick={handleTranslate} className="send-btn" disabled={isLoading}>
            Translate
          </button>
        </div>

        <div className="chat-input">
          <textarea
            placeholder="Type here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            aria-label="Message input"
            disabled={isLoading}
          />
          <button onClick={handleSend} className="send-button" disabled={isLoading}>
            <FontAwesomeIcon icon={faCircleArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;