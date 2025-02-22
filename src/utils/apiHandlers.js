const isWindowAiAvailable = (feature) => {
	const available = typeof window !== "undefined" && window.ai && window.ai[feature];
	console.log(`${feature} available: ${available}`);
	return available;
  };
  
  export const isTranslatorAvailable = () => isWindowAiAvailable("translator");
  export const isLanguageDetectorAvailable = () => isWindowAiAvailable("languageDetector");
  export const isSummarizerAvailable = () => isWindowAiAvailable("summarizer");
  
  export const translateText = async (text, targetLanguage, sourceLanguage = "auto", onProgress) => {
	if (!isTranslatorAvailable()) {
	  console.log("Translator API not available - check Origin Trial token");
	  return null;
	}
  
	try {
	  const capabilities = await window.ai.translator.capabilities();
	  console.log("Translator capabilities:", capabilities);
	  const pairAvailable = capabilities.languagePairAvailable(sourceLanguage, targetLanguage);
	  console.log(`Language pair ${sourceLanguage} -> ${targetLanguage} available: ${pairAvailable}`);
	  if (pairAvailable === "no") return null;
  
	  const translatorOptions = { sourceLanguage, targetLanguage };
	  if (onProgress) {
		translatorOptions.monitor = (m) =>
		  m.addEventListener("downloadprogress", (e) => {
			console.log(`Translator download: ${e.loaded}/${e.total} bytes`);
			onProgress(e.loaded, e.total);
		  });
	  }
  
	  const translator = await window.ai.translator.create(translatorOptions);
	  console.log("Translator created for", targetLanguage);
	  const translatedText = await translator.translate(text);
	  console.log("Translated text:", translatedText);
	  return translatedText || null;
	} catch (error) {
	  console.error("Translation error:", error.message);
	  return null;
	}
  };
  
  export const detectLanguage = async (text, onProgress) => {
	if (!isLanguageDetectorAvailable()) return null;
  
	try {
	  const capabilities = await window.ai.languageDetector.capabilities();
	  console.log("Detector capabilities:", capabilities);
	  const canDetect = capabilities.available;
  
	  if (canDetect === "no") return null;
  
	  const detectorOptions = {};
	  if (canDetect === "after-download" && onProgress) {
		detectorOptions.monitor = (m) =>
		  m.addEventListener("downloadprogress", (e) => onProgress(e.loaded, e.total));
	  }
  
	  const detector = await window.ai.languageDetector.create(detectorOptions);
	  if (canDetect === "after-download") await detector.ready;
  
	  const results = await detector.detect(text);
	  console.log("Detected language:", results[0]?.detectedLanguage);
	  return results[0]?.detectedLanguage || null;
	} catch (error) {
	  console.error("Language detection error:", error);
	  return null;
	}
  };
  
  export const summarizeText = async (text, onProgress) => {
	if (!isSummarizerAvailable()) {
	  console.log("Summarizer API not available");
	  return null;
	}
  
	try {
	  const capabilities = await window.ai.summarizer.capabilities();
	  console.log("Summarizer capabilities:", capabilities);
	  const canSummarize = capabilities.available;
  
	  if (canSummarize === "no") {
		console.log("Summarization not supported");
		return null;
	  }
  
	  const summarizerOptions = {};
	  if (canSummarize === "after-download" && onProgress) {
		summarizerOptions.monitor = (m) =>
		  m.addEventListener("downloadprogress", (e) => {
			console.log(`Summarizer download: ${e.loaded}/${e.total} bytes`);
			onProgress(e.loaded, e.total);
		  });
	  }
  
	  const summarizer = await window.ai.summarizer.create(summarizerOptions);
	  console.log("Summarizer created");
	  if (canSummarize === "after-download") await summarizer.ready;
  
	  const summary = await summarizer.summarize(text);
	  console.log("Generated summary:", summary);
	  return summary || null;
	} catch (error) {
	  console.error("Summarization error:", error.message);
	  return null;
	}
};