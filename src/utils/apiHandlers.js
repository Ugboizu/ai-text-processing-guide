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

export async function translateText(text, targetLanguage) {
  if (typeof window !== 'undefined' && window.ai && window.ai.translator) {
      console.log("The Translator API is available");
  } else {
      return null;
  }

  try {
      const translatorCapabilities = await window.ai.translator.capabilities();
      const languagePairAvailable = translatorCapabilities.languagePairAvailable("auto", targetLanguage);

      if (languagePairAvailable === 'no') {
          return "Language pair not supported";
      }

      const translator = await window.ai.translator.create({
          sourceLanguage: "auto",
          targetLanguage: targetLanguage,
      });

      const translatedText = await translator.translate(text);
      return translatedText;
  } catch (error) {
      console.error('Translation error:', error);
      return null;
  }
}

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

export async function detectLanguage(someUserText) {
  if (typeof window !== 'undefined' && window.ai && window.ai.languageDetector) {
      console.log("The Language Detector API is available");
  } else {
      return null;
  }

  try {
      const languageDetectorCapabilities = await window.ai.languageDetector.capabilities();
      const canDetect = languageDetectorCapabilities.available;
      let detector;

      if (canDetect === 'no') {
          return null;
      } else if (canDetect === 'readily') {
          detector = await window.ai.languageDetector.create();
      } else {
          detector = await window.ai.languageDetector.create({
              monitor(m) {
                  m.addEventListener('downloadprogress', (e) => {
                      console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
                  });
              },
          });
          await detector.ready;
      }

      const results = await detector.detect(someUserText);
      return results[0].detectedLanguage;
  } catch (error) {
      console.error('Language detection error:', error);
      return null;
  }
}

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

export async function summarizeText(text) {
  if (typeof window !== 'undefined' && window.ai && window.ai.summarizer) {
      console.log("The Summarizer API is available");
  } else {
      return null;
  }

  try {
      const summarizerCapabilities = await window.ai.summarizer.capabilities();
      const canSummarize = summarizerCapabilities.available;

      if (canSummarize === 'no') {
          return "Summarization not available";
      }

      const summarizer = await window.ai.summarizer.create();
      const summary = await summarizer.summarize(text);
      return summary;
  } catch (error) {
      console.error('Summarization error:', error);
      return null;
  }
}