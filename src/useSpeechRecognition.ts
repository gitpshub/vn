import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    webkitSpeechRecognition: SpeechRecognition;
  }
}

type SpeechRecognitionHook = {
  listening: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
};

export const useSpeechRecognition = (
  onFinalResult: (result: string) => void,
  onInterimResult: (result: string) => void
): SpeechRecognitionHook => {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isAndroid = /Android/i.test(navigator.userAgent);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Browser does not support speech recognition');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = isAndroid ? false : true;
    recognition.interimResults = true;
    recognition.lang = 'ru-RU';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results[event.resultIndex];
      const transcript = results[0].transcript;

      if (results.isFinal && results[0].confidence > 0) {
        onFinalResult(transcript);
        if (isAndroid) {
          setTimeout(() => recognition.start(), 100);
        }
      } else {
        onInterimResult(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Ошибка распознавания: ${event.error}`);
    };

    recognition.onend = () => {
      if (isAndroid) {
        setTimeout(() => recognition.start(), 100);
      } else {
        setListening(false);
      }
    };

    return () => recognition.stop();
  }, [onFinalResult, onInterimResult, isAndroid]);

  const startListening = () => {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      setListening(false);
      recognitionRef.current.stop();
    }
  };

  return { listening, error, startListening, stopListening };
};
