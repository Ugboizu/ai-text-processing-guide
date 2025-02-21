// utils/apiHandlers.js

// --- Feature Detection ---
export const isTranslatorApiAvailable = () => {
    return typeof window !== 'undefined' && window.ai && window.ai.translator;
};

export const isLanguageDetectorApiAvailable = () => {
    return typeof window !== 'undefined' && window.ai && window.ai.languageDetector;
};

export const isSummarizerApiAvailable = () => {
    return typeof window !== 'undefined' && window.ai && window.ai.summarizer;
};

// --- Translator API ---
export const checkLanguagePairAvailability = async (sourceLanguage, targetLanguage) => {
    if (!isTranslatorApiAvailable()) return 'no';
    try {
        const translatorCapabilities = await window.ai.translator.capabilities();
        return translatorCapabilities.languagePairAvailable(sourceLanguage, targetLanguage);
    } catch (error) {
        console.error("Error checking language pair:", error);
        return 'no';
    }
};

export const createTranslator = async (sourceLanguage, targetLanguage, onDownloadProgress) => {
    if (!isTranslatorApiAvailable()) throw new Error("Translator API not available");

    const options = {
        sourceLanguage,
        targetLanguage,
    };

    if (onDownloadProgress) {
        options.monitor = (m) => {
            m.addEventListener('downloadprogress', (e) => {
                onDownloadProgress(e.loaded, e.total);
            });
        };
    }

    try {
        const translator = await window.ai.translator.create(options);
        return translator;
    } catch (error) {
        console.error("Error creating translator:", error);
        throw error;
    }
};

export const translateText = async (translator, text) => {
    try {
        return await translator.translate(text);
    } catch (error) {
        console.error("Translation error:", error);
        throw error;
    }
};

// --- Language Detector API ---
export const checkLanguageDetectorCapabilities = async (onDownloadProgress) => {
    if (!isLanguageDetectorApiAvailable()) return { available: 'no' };
    try {
        const languageDetectorCapabilities = await window.ai.languageDetector.capabilities();
        if (languageDetectorCapabilities.available === 'after-download' && onDownloadProgress) {
            return {
                ...languageDetectorCapabilities,
                monitor: (m) => {
                    m.addEventListener('downloadprogress', (e) => {
                        onDownloadProgress(e.loaded, e.total);
                    });
                },
            };
        }
        return languageDetectorCapabilities;
    } catch (error) {
        console.error("Error checking language detector capabilities:", error);
        return { available: 'no' };
    }
};

export const createLanguageDetector = async (monitor) => {
    if (!isLanguageDetectorApiAvailable()) throw new Error("Language Detector API not available");
    try {
        if (monitor) {
            return await window.ai.languageDetector.create({ monitor });
        }
        return await window.ai.languageDetector.create();
    } catch (error) {
        console.error("Error creating language detector:", error);
        throw error;
    }
};

export const detectLanguage = async (detector, text) => {
    try {
        return await detector.detect(text);
    } catch (error) {
        console.error("Language detection error:", error);
        throw error;
    }
};

// --- Summarizer API ---
export const checkSummarizerCapabilities = async (onDownloadProgress) => {
    if (!isSummarizerApiAvailable()) return { available: 'no' };
    try {
        const summarizerCapabilities = await window.ai.summarizer.capabilities();
        if (summarizerCapabilities.available === 'after-download' && onDownloadProgress) {
            return {
                ...summarizerCapabilities,
                monitor: (m) => {
                    m.addEventListener('downloadprogress', (e) => {
                        onDownloadProgress(e.loaded, e.total);
                    });
                },
            };
        }
        return summarizerCapabilities;
    } catch (error) {
        console.error("Error checking summarizer capabilities:", error);
        return { available: 'no' };
    }
};

export const createSummarizer = async (options, monitor) => {
    if (!isSummarizerApiAvailable()) throw new Error("Summarizer API not available");
    try {
        if (monitor) {
            return await window.ai.summarizer.create({ ...options, monitor });
        }
        return await window.ai.summarizer.create(options);
    } catch (error) {
        console.error("Error creating summarizer:", error);
        throw error;
    }
};

export const summarizeText = async (summarizer, text, context) => {
    try {
        return await summarizer.summarize(text, { context });
    } catch (error) {
        console.error("Summarization error:", error);
        throw error;
    }
};