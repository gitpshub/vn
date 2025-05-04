import { useState, useEffect, useRef, useCallback } from 'react';

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
  const listeningRef = useRef<boolean>(false);
  const isAndroid = /Android/i.test(navigator.userAgent);

  console.log('reload', listening);

  const startListening = useCallback(() => {
    console.log('startListening');
    if (recognitionRef.current) {
      // console.log(' - listening', listening);
      setListening(true);
      listeningRef.current = true;
      recognitionRef.current.start();
    }
  },[]);

  const stopListening = useCallback(() => {
    console.log('stopListening', recognitionRef.current);
    if (recognitionRef.current) {
      // console.log(' - listening', listening);
      setListening(false);
      listeningRef.current = false;
      recognitionRef.current.stop();
    }
  },[]);

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
      console.log('onresult', listening);
      const results = event.results[event.resultIndex];
      const transcript = results[0].transcript;

      if (results.isFinal && results[0].confidence > 0) {
        onFinalResult(transcript);
        // if (isAndroid) {
        //   setTimeout(startListening, 100);
        // }
      } else {
        onInterimResult(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('onerror', event.error);
      if (isAndroid && event.error == 'no-speech') {
        setListening(true);
        listeningRef.current = true;
        return;
      }
      setError(`${event.error}`);
    };

    recognition.onend = () => {
      console.log('onend', listening, listeningRef.current);
      if (isAndroid) {
        if (listeningRef.current) setTimeout(startListening, 100);
      } else {
        setListening(false);
        listeningRef.current = false;
      }
    };

    return () => recognition.stop();
  }, [isAndroid, onFinalResult, onInterimResult, listening, startListening]); //isAndroid, onFinalResult, onInterimResult, listening


  return { listening, error, startListening, stopListening };
};
