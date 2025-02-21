import React, { useState, useEffect } from "react";
import "../css/ChatInterface.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
import Header from "../components/Header";

const ChatInterface = () => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const languages = [
    { code: "en", name: "English" },
    { code: "pt", name: "Portuguese" },
    { code: "es", name: "Spanish" },
    { code: "ru", name: "Russian" },
    { code: "tr", name: "Turkish" },
    { code: "fr", name: "French" },
  ];

  useEffect(() => {
    if (!window.ai) {
      console.warn(
        "Chrome AI APIs not available. Enable experimental flags in chrome://flags (e.g., #prompt-api) or use Chrome Canary."
      );
      setMessages((prev) => [
        ...prev,
        {
          text: "Chrome AI APIs not detected. Enable experimental features.",
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

    try {
      const langSession = await window.ai.languageDetector.create({});
      const langResult = await langSession.detect(inputText);
      const language = langResult[0]?.language || "Unknown";

      setMessages((prev) => [
        ...prev,
        { text: `Detected Language: ${language}`, type: "bot" },
      ]);

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
        { text: "Error detecting language", type: "bot", error: true },
      ]);
      console.error("Language Detection Error:", error);
    }

    setInputText("");
  };

  const handleSummarize = async (text) => {
    try {
      const session = await window.ai.summarizer.create({});
      const summary = await session.summarize(text);
      setMessages((prev) => [
        ...prev,
        { text: `Summary: ${summary}`, type: "bot" },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Summarization error", type: "bot", error: true },
      ]);
      console.error("Summarization Error:", error);
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

    try {
      const session = await window.ai.translator.create({
        targetLanguage: selectedLanguage,
      });
      const translation = await session.translate(textToTranslate);
      setMessages((prev) => [
        ...prev,
        { text: `Translated: ${translation}`, type: "bot" },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Translation error", type: "bot", error: true },
      ]);
      console.error("Translation Error:", error);
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
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <button onClick={handleTranslate} className="send-btn">
            Translate
          </button>
        </div>

        <div className="chat-input">
          <textarea
            placeholder="Type here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            aria-label="Message input"
          />
          <button onClick={handleSend} className="send-button">
            <FontAwesomeIcon icon={faCircleArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;