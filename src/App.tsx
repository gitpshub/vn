import { useState, useEffect, useCallback } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaPaperPlane,
  FaTrash,
} from 'react-icons/fa';
import ErrorForm from './components/ErrorForm';
import Timer from './components/Timer';
import { requestWakeLock } from './utils';

const App = () => {
  const API_KEY = '';
  const API_URL = '';

  const saveToLocalStorage = (text: string) => {
    localStorage.setItem('finalText', text);
  };

  const [text, setText] = useState(localStorage.getItem('finalText') || '');
  const [interimText, setInterimText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFinalResult = useCallback((result: string) => {
    setText((prev) => {
      const newResult = `${prev} ${result}`.trim();
      saveToLocalStorage(newResult);
      return newResult;
    });
    setInterimText('');
  }, []);

  const handleInterimResult = useCallback((result: string) => {
    setInterimText(result);
  }, []);

  const { listening, error, startListening, stopListening } =
    useSpeechRecognition(handleFinalResult, handleInterimResult);

  useEffect(() => {
    if (listening) {
      requestWakeLock();
    }
  }, [listening]);

  const toggleListening = () => {
    if (listening) {
      stopListening();
      setText((prev) => `${prev} ${interimText}`.trim());
      setInterimText('');
    } else {
      startListening();
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setSubmitting(true);

    const finalText = localStorage.getItem('finalText');
    const timerStartTime = localStorage.getItem('timerStartTime') || '';
    const timerStopTime = localStorage.getItem('timerStopTime') || '';

    const dataForSend = {
      finalText,
      timerStartTime,
      timerStopTime,
    };

    fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `ApiKey ${API_KEY}`,
      },
      body: JSON.stringify({ ...dataForSend }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Ошибка сети');
        }
        console.log('Успех:', response);
        setSubmitting(false);
      })
      .catch((error) => {
        console.error('Ошибка отправки:', error);
        setSubmitting(false);
      });
  };

  const handleChange = (changedText: string) => {
    setText(changedText);
    saveToLocalStorage(changedText);
  };

  const handleTrash = () => {
    setText('');
    saveToLocalStorage('');
  };

  const submitDisabled = submitting || !text || listening;

  return (
    <div className='main'>
      {error != null && <ErrorForm error={error} />}

      {error == null && (
        <>
          <div className='buttons'>
            <button
              className={listening ? 'animate' : ''}
              onClick={toggleListening}
              style={{
                backgroundColor: listening ? '#ff4444' : '#4CAF50',
              }}
            >
              {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitDisabled}
              style={{
                backgroundColor: submitDisabled ? '#999' : '#2196F3',
              }}
            >
              {submitting ? <FaPaperPlane /> : <FaPaperPlane />}
            </button>

            <button
              onClick={handleTrash}
              style={{
                backgroundColor: '#4CAF50',
                marginLeft: 'auto',
              }}
            >
              <FaTrash />
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => {
              handleChange(e.target.value);
            }}
            placeholder='Результаты распознавания...'
            style={{
              flexGrow: '1',
            }}
          />

          <textarea
            value={interimText}
            readOnly
            placeholder='Текст в процессе распознавания...'
            style={{
              backgroundColor: '#f5f5f5',
            }}
          />
          <Timer />
        </>
      )}
    </div>
  );
};

export default App;
