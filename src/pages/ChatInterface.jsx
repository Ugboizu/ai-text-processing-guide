import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowRight } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import * as apiHandlers from '../utils/apiHandlers';

const ChatInterface = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // General loading state
  const [summarizingId, setSummarizingId] = useState(null); // Track which message is being summarized
  const [progress, setProgress] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [apiStatus, setApiStatus] = useState({
    detect: false,
    translate: false,
    summarize: false,
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'es', name: 'Spanish' },
    { code: 'ru', name: 'Russian' },
    { code: 'tr', name: 'Turkish' },
    { code: 'fr', name: 'French' },
  ];

  useEffect(() => {
    const checkApis = async () => {
      const [detect, translate, summarize] = await Promise.all([
        apiHandlers.isLanguageDetectorAvailable(),
        apiHandlers.isTranslatorAvailable(),
        apiHandlers.isSummarizerAvailable(),
      ]);
      setApiStatus({ detect, translate, summarize });
      if (!summarize) console.log('Summarization API unavailable - check token');
    };
    checkApis();
  }, []);

  const handleProcessText = async () => {
    if (!inputText.trim()) {
      setMessages((prev) => [...prev, { text: 'Please enter some text!', type: 'bot', error: true }]);
      return;
    }
    if (!apiStatus.detect) {
      setMessages((prev) => [...prev, { text: 'Language detection feature unavailable.', type: 'bot', error: true }]);
      return;
    }

    setIsLoading(true);
    try {
      const language = await apiHandlers.detectLanguage(inputText, (loaded, total) =>
        setProgress(`Downloading detector: ${loaded}/${total} bytes`)
      );
      if (!language) throw new Error('Failed to detect language');
      
      setMessages((prev) => [
        ...prev,
        {
          text: inputText,
          type: 'user',
          canSummarize: apiStatus.summarize && language === 'en' && inputText.length > 150,
          id: Date.now()
        },
        { text: `Detected Language: ${language}`, type: 'bot' }
      ]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: `Error: ${error.message}`, type: 'bot', error: true }]);
    } finally {
      setIsLoading(false);
      setInputText('');
      setProgress(null);
    }
  };

  const handleTranslate = async () => {
    const lastUserMessage = messages.slice().reverse().find((msg) => msg.type === 'user' && msg.text);
    const textToTranslate = lastUserMessage ? lastUserMessage.text : inputText;

    if (!textToTranslate) {
      setMessages((prev) => [...prev, { text: 'No text to translate!', type: 'bot', error: true }]);
      return;
    }
    if (!apiStatus.translate) {
      setMessages((prev) => [...prev, { text: 'Translation feature unavailable.', type: 'bot', error: true }]);
      return;
    }

    setIsLoading(true);
    try {
      const detectedLang = messages.find((msg) => msg.text.startsWith('Detected Language:'))?.text.split(': ')[1] || 'auto';
      const translated = await apiHandlers.translateText(
        textToTranslate,
        selectedLanguage,
        detectedLang,
        (loaded, total) => setProgress(`Downloading translator: ${loaded}/${total} bytes`)
      );
      if (!translated) {
        setMessages((prev) => [
          ...prev,
          { text: `Translation from ${detectedLang} to ${languages.find(lang => lang.code === selectedLanguage)?.name} not supported or failed.`, type: 'bot', error: true }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { text: `Translated to ${languages.find(lang => lang.code === selectedLanguage)?.name}: ${translated}`, type: 'bot' }
        ]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { text: `Translation Error: ${error.message}`, type: 'bot', error: true }]);
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  const handleSummarize = async (messageId, text) => {
    if (!apiStatus.summarize) {
      setMessages((prev) => [...prev, { text: 'Summarization unavailable.', type: 'bot', error: true }]);
      return;
    }
    setIsLoading(true);
    setSummarizingId(messageId); // Mark this message as being summarized
    try {
      const summary = await apiHandlers.summarizeText(text, (loaded, total) =>
        setProgress(`Downloading summarizer: ${loaded}/${total} bytes`)
      );
      if (!summary) {
        setMessages((prev) => [...prev, { text: 'Summarization failed or not supported.', type: 'bot', error: true }]);
      } else {
        setMessages((prev) => [...prev, { text: `Summary: ${summary}`, type: 'bot', relatedTo: messageId }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { text: `Summarization Error: ${error.message}`, type: 'bot', error: true }]);
    } finally {
      setIsLoading(false);
      setSummarizingId(null); // Clear summarizing state
      setProgress(null);
    }
  };

  const handleInputChange = (e) => setInputText(e.target.value);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleProcessText();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex flex-col w-full max-w-4xl mx-auto h-[calc(100vh-4rem)] mt-4 bg-white rounded-lg shadow-lg overflow-hidden">
        <div
          className="flex-1 p-4 overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-viola-purple scrollbar-track-viola-pink scrollbar-thumb-rounded-md"
          role="log"
          aria-live="polite"
        >
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 italic">Start by typing a message below!</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 m-1 rounded-[20px] max-w-[75%] break-words font-underdog text-sm leading-[1.4] ${
                msg.type === 'user' ? 'self-end bg-purple-100 text-black' : 'self-start bg-gray-100 text-black'
              } ${msg.error ? 'bg-red-500 text-white' : ''}`}
            >
              {msg.text}
              {msg.canSummarize && msg.type === 'user' && (
                <button
                  onClick={() => handleSummarize(msg.id, msg.text)}
                  className="bg-indigo-600 text-white px-4 py-1 ml-3 rounded-lg hover:bg-indigo-700 transition duration-200 text-sm font-roboto font-medium disabled:bg-indigo-400"
                  disabled={isLoading}
                  aria-label={`Summarize message: ${msg.text}`}
                >
                  {summarizingId === msg.id && isLoading ? 'Summarizing...' : 'Summarize'}
                </button>
              )}
            </div>
          ))}
          {progress && (
            <div className="self-center p-2 flex items-center gap-2 text-gray-500 italic">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              {progress}
            </div>
          )}
        </div>

        <div className="flex gap-3 mx-4 justify-center items-center p-2 border-t border-gray-200">
          <div className="flex gap-2 w-full sm:w-auto">
            <label htmlFor="language-select" className="sr-only">Select language for translation</label>
            <select
              id="language-select"
              onChange={(e) => setSelectedLanguage(e.target.value)}
              value={selectedLanguage}
              aria-label="Select language for translation"
              disabled={isLoading}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-roboto font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            <button
              onClick={handleTranslate}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 text-sm font-roboto font-medium disabled:bg-indigo-400"
              disabled={isLoading}
              aria-label="Translate message"
            >
              Translate
            </button>
          </div>
        </div>

        <div className="flex p-3 border-t border-gray-200 bg-white">
          <label htmlFor="chat-input" className="sr-only">Enter your message</label>
          <textarea
            id="chat-input"
            placeholder="Type here..."
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            aria-label="Message input"
            disabled={isLoading}
            className="flex-1 p-3 rounded-lg font-underdog border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm placeholder:text-gray-500 placeholder:font-medium placeholder:text-sm placeholder:italic placeholder:font-underdog"
            rows="2"
          />
          <button
            onClick={handleProcessText}
            className="bg-viola-dark text-white p-3 rounded-lg hover:bg-viola-dark/80 transition duration-200 disabled:bg-viola-dark/50 ml-2"
            disabled={isLoading}
            aria-label="Send message"
          >
            <FontAwesomeIcon icon={faCircleArrowRight} className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;