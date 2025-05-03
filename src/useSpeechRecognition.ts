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
  // const [recognitionItem, setRecognitionItem] =
  //   useState<SpeechRecognition | null>(null);

  const recognitionRef = useRef<SpeechRecognition|null>(null);
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

    // recognition.continuous = true;
    // recognition.interimResults = true;
    // //-recognition.maxAlternatives = 1;
    recognition.lang = 'ru-RU';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // let final = '';
      // let interim = '';

      // for (let i = event.resultIndex; i < event.results.length; ++i) {
      //   const result = event.results[i];
      //   if (result.isFinal && (result[0].confidence > 0)) {
      //     final += result[0].transcript;
      //   } else {
      //     interim += result[0].transcript;
      //   }
      // }

      // if (final) onFinalResult(final);
      // if (interim) onInterimResult(interim);

      // best
      // const result = event.results[event.resultIndex];
  
      // if (result.isFinal && (result[0].confidence > 0)) {
      //   onFinalResult(result[0].transcript);
      // } else {
      //   onInterimResult(result[0].transcript);
      // }

      const results = event.results[event.resultIndex];
      const transcript = results[0].transcript;

      if (results.isFinal && (results[0].confidence > 0)) {
        onFinalResult(transcript);
        if (isAndroid) {
          setTimeout(() => recognition.start(), 100);
        }
      } else {
        onInterimResult(transcript);
      }

    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      // setListening(false);
      if (isAndroid && listening) {
        // Перезапускаем распознавание для Android
        setTimeout(() => recognition.start(), 100);
      } else {
        setListening(false);
      }
    };

    // setRecognitionItem(recognition);

    return () => recognition.stop();
  }, [onFinalResult, onInterimResult]); 

  const startListening = () => {
    // setListening(true);
    // recognitionItem?.start();
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    // setListening(false);
    // recognitionItem?.stop();
    if (recognitionRef.current) {
      setListening(false);
      recognitionRef.current.stop();
    }
  };

  return { listening, error, startListening, stopListening };
};
