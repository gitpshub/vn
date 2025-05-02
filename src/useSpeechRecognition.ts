import { useState, useEffect } from 'react';

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
  const [recognitionItem, setRecognitionItem] =
    useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Browser does not support speech recognition');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'ru-RU';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal && (result[0].confidence > 0)) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) onFinalResult(final);
      if (interim) onInterimResult(interim);

      // const results = event.results[event.resultIndex];
  
      // if (results.isFinal) {
      //   onFinalResult(final);
      // } else {
      //   onInterimResult(interim);
      // }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setListening(false);
    };

    setRecognitionItem(recognition);

    return () => recognition.stop();
  }, [onFinalResult, onInterimResult]); 

  const startListening = () => {
    setListening(true);
    // const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    // if (SpeechRecognition) {
    //   const recognition = new SpeechRecognition();
    recognitionItem?.start();
    // }
  };

  const stopListening = () => {
    setListening(false);
    // const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    // if (SpeechRecognition) {
    //   const recognition = new SpeechRecognition();
    recognitionItem?.stop();
    // }
  };

  return { listening, error, startListening, stopListening };
};
