import React, { useState, useEffect } from "react";
import "../css/ChatInterface.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
import Header from "../components/Header";
import * as apiHandlers from "../utils/apiHandlers";

const ChatInterface = () => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [apiStatus, setApiStatus] = useState({
    detect: false,
    translate: false,
    summarize: false,
  });

  const languages = [
    { code: "en", name: "English" },
    { code: "pt", name: "Portuguese" },
    { code: "es", name: "Spanish" },
    { code: "ru", name: "Russian" },
    { code: "tr", name: "Turkish" },
    { code: "fr", name: "French" },
  ];

  useEffect(() => {
    const checkApis = async () => {
      const [detect, translate, summarize] = await Promise.all([
        apiHandlers.isLanguageDetectorAvailable(),
        apiHandlers.isTranslatorAvailable(),
        apiHandlers.isSummarizerAvailable(),
      ]);
      setApiStatus({ detect, translate, summarize });
      if (!summarize) console.log("Summarization API unavailable - check token");
    };
    checkApis();
  }, []);

  const handleProcessText = async () => {
    if (!inputText.trim()) {
      setMessages((prev) => [...prev, { text: "Please enter some text!", type: "bot", error: true }]);
      return;
    }

    if (!apiStatus.detect || !apiStatus.translate || !apiStatus.summarize) {
      setMessages((prev) => [
        ...prev,
        { text: "Required AI features are unavailable.", type: "bot", error: true },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { text: inputText, type: "user" }]);
    setIsLoading(true);

    try {
      const language = await apiHandlers.detectLanguage(inputText, (loaded, total) =>
        setProgress(`Downloading detector: ${loaded}/${total} bytes`)
      );
      if (!language) throw new Error("Failed to detect language");
      setMessages((prev) => [...prev, { text: `Detected Language: ${language}`, type: "bot" }]);

      let textToSummarize = inputText;
      if (language !== "en") {
        const translated = await apiHandlers.translateText(
          inputText,
          "en",
          language,
          (loaded, total) => setProgress(`Downloading translator: ${loaded}/${total} bytes`)
        );
        if (!translated) {
          setMessages((prev) => [
            ...prev,
            { text: `Translation from ${language} to English not supported or failed.`, type: "bot", error: true },
          ]);
        } else {
          setMessages((prev) => [...prev, { text: `Translated to English: ${translated}`, type: "bot" }]);
          textToSummarize = translated;
        }
      }

      const wordCount = textToSummarize.split(/\s+/).length;
      console.log("Word count:", wordCount, "Text:", textToSummarize);
      if (wordCount > 150) {
        console.log("Attempting to summarize...");
        const summary = await apiHandlers.summarizeText(textToSummarize, (loaded, total) =>
          setProgress(`Downloading summarizer: ${loaded}/${total} bytes`)
        );
        console.log("Summary result:", summary);
        if (!summary) {
          setMessages((prev) => [
            ...prev,
            { text: "Summarization failed or not supported.", type: "bot", error: true },
          ]);
        } else {
          setMessages((prev) => [...prev, { text: `Summary: ${summary}`, type: "bot" }]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { text: `Text too short to summarize (${wordCount} words < 150)`, type: "bot" },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { text: `Error: ${error.message}`, type: "bot", error: true }]);
    } finally {
      setIsLoading(false);
      setInputText("");
      setProgress(null);
    }
  };

  const handleTranslate = async () => {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.type === "user" && msg.text);
    const textToTranslate = lastUserMessage ? lastUserMessage.text : inputText;

    if (!textToTranslate) {
      setMessages((prev) => [...prev, { text: "No text to translate!", type: "bot", error: true }]);
      return;
    }

    if (!apiStatus.translate) {
      setMessages((prev) => [
        ...prev,
        { text: "Translation feature unavailable.", type: "bot", error: true },
      ]);
      return;
    }

    setIsLoading(true);
    try {
      const detectedLang = messages
        .find((msg) => msg.text.startsWith("Detected Language:"))
        ?.text.split(": ")[1] || "auto";
      const translated = await apiHandlers.translateText(
        textToTranslate,
        selectedLanguage,
        detectedLang,
        (loaded, total) => setProgress(`Downloading translator: ${loaded}/${total} bytes`)
      );
      if (!translated) {
        setMessages((prev) => [
          ...prev,
          { text: `Translation from ${detectedLang} to ${selectedLanguage} not supported or failed.`, type: "bot", error: true },
        ]);
      } else {
        setMessages((prev) => [...prev, { text: `Translated to ${selectedLanguage}: ${translated}`, type: "bot" }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { text: `Translation Error: ${error.message}`, type: "bot", error: true }]);
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  const handleInputChange = (e) => setInputText(e.target.value);

  return (
    <div>
      <Header />
      <div className="chat-container">
        <div className="chat-output" role="log" aria-live="polite">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.type}${msg.error ? " error" : ""}`}
            >
              {msg.text}
            </div>
          ))}
          {progress && <div className="progress">{progress}</div>}
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
          <button
            onClick={handleTranslate}
            className="send-btn"
            disabled={isLoading}
          >
            Translate
          </button>
        </div>
        <div className="chat-input">
          <textarea
            placeholder="Type here..."
            value={inputText}
            onChange={handleInputChange}
            aria-label="Message input"
            disabled={isLoading}
          />
          <button
            onClick={handleProcessText}
            className="send-button"
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faCircleArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;