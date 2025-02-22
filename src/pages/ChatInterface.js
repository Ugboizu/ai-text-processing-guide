import React, { useState, useEffect } from "react";
import "../css/ChatInterface.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
import Header from "../components/Header";
import * as apiHandlers from '../utils/apiHandlers';

const ChatInterface = () => {
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const [isLoading, setIsLoading] = useState(false);

    const languages = [
        { code: "en", name: "English" },
        { code: "pt", name: "Portuguese" },
        { code: "es", name: "Spanish" },
        { code: "ru", name: "Russian" },
        { code: "tr", name: "Turkish" },
        { code: "fr", name: "French" },
    ];

    useEffect(() => {
        const initializeAi = async () => {
            if (apiHandlers.isTranslatorApiAvailable()) {
                const availability = await apiHandlers.checkLanguagePairAvailability('en', 'fr');
                console.log("Translator availability:", availability);
            }

            if (apiHandlers.isLanguageDetectorApiAvailable()) {
                const capabilities = await apiHandlers.checkLanguageDetectorCapabilities();
                console.log("language detector capabilities: ", capabilities);
            }

            if (apiHandlers.isSummarizerApiAvailable()) {
                const capabilities = await apiHandlers.checkSummarizerCapabilities();
                console.log("summarizer capabilities: ", capabilities);
            }
        }
        initializeAi();
    }, []);

    const handleSend = async () => {
        if (!inputText.trim()) {
            setMessages((prev) => [...prev, { text: "Please enter some text!", type: "bot", error: true }]);
            return;
        }

        setMessages((prev) => [...prev, { text: inputText, type: "user" }]);
        setIsLoading(true);

        try {
            if (apiHandlers.isLanguageDetectorApiAvailable()) {
                const language = await apiHandlers.detectLanguage(inputText);
                if (language) {
                    setMessages((prev) => [...prev, { text: `Detected Language: ${language}`, type: "bot" }]);

                    if (language === "en" && inputText.length > 150) {
                        setMessages((prev) => [...prev, { text: "Summarize available", type: "bot", summarize: true, originalText: inputText }]);
                    }
                } else {
                    setMessages((prev) => [...prev, { text: "Language detection failed.", type: "bot", error: true }]);
                }
            } else {
                setMessages((prev) => [...prev, { text: "Language detection not available.", type: "bot", error: true }]);
            }
        } catch (error) {
            setMessages((prev) => [...prev, { text: `Error detecting language: ${error.message}`, type: "bot", error: true }]);
            console.error("Language Detection Error:", error);
        } finally {
            setIsLoading(false);
            setInputText("");
        }
    };

    const handleSummarize = async (text) => {
        setIsLoading(true);
        try {
            if (apiHandlers.isSummarizerApiAvailable()) {
                const summary = await apiHandlers.summarizeText(text);
                if (summary) {
                    setMessages((prev) => [...prev, { text: `Summary: ${summary}`, type: "bot" }]);
                } else {
                    setMessages((prev) => [...prev, { text: "Summarization failed.", type: "bot", error: true }]);
                }
            } else {
                setMessages((prev) => [...prev, { text: "Summarization not available.", type: "bot", error: true }]);
            }
        } catch (error) {
            setMessages((prev) => [...prev, { text: `Summarization error: ${error.message}`, type: "bot", error: true }]);
            console.error("Summarization Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTranslate = async () => {
        const lastUserMessage = messages.slice().reverse().find((msg) => msg.type === "user" && msg.text);
        const textToTranslate = lastUserMessage ? lastUserMessage.text : inputText;

        if (!textToTranslate) {
            setMessages((prev) => [...prev, { text: "No text to translate", type: "bot", error: true }]);
            return;
        }

        setIsLoading(true);
        try {
            if (apiHandlers.isTranslatorApiAvailable()) {
                const translation = await apiHandlers.translateText(textToTranslate, selectedLanguage);
                if (translation) {
                    setMessages((prev) => [...prev, { text: `Translated: ${translation}`, type: "bot" }]);
                } else {
                    setMessages((prev) => [...prev, { text: "Translation failed.", type: "bot", error: true }]);
                }
            } else {
                setMessages((prev) => [...prev, { text: "Translation not available.", type: "bot", error: true }]);
            }
        } catch (error) {
            setMessages((prev) => [...prev, { text: `Translation error: ${error.message}`, type: "bot", error: true }]);
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
                        <div key={index} className={`chat-message ${msg.type} ${msg.error ? "error" : ""}`}>
                            {msg.text} <br />
                            {msg.summarize && (
                                <button onClick={() => handleSummarize(msg.originalText)} className="send-btn" disabled={isLoading}>
                                    Summarize
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="translation-controls">
                    <select onChange={(e) => setSelectedLanguage(e.target.value)} value={selectedLanguage} aria-label="Select language for translation" disabled={isLoading}>
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
                    <textarea placeholder="Type here..." value={inputText} onChange={(e) => setInputText(e.target.value)} aria-label="Message input" disabled={isLoading} />
                    <button onClick={handleSend} className="send-button" disabled={isLoading}>
                        <FontAwesomeIcon icon={faCircleArrowRight} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;