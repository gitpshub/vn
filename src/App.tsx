import { useState, useCallback } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { FaMicrophone, FaMicrophoneSlash, FaPaperPlane } from 'react-icons/fa';

const App = () => {
  const [text, setText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFinalResult = useCallback((result: string) => {
    setText(prev => `${prev} ${result}`.trim());
    setInterimText('');
  }, []);

  const { listening, error, startListening, stopListening } = useSpeechRecognition(
    handleFinalResult,
    setInterimText
  );

  const toggleListening = () => {
    if (listening) {
      stopListening();
      setText(prev => `${prev} ${interimText}`.trim());
      setInterimText('');
    } else {
      startListening();
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    
    setSubmitting(true);
    try {
      // Замените URL на ваш эндпоинт
      const response = await fetch('https://your-api-endpoint.example.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Ошибка отправки');
      alert('Текст успешно отправлен!');
      setText('');
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Произошла ошибка при отправке');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h1>Голосовой ввод с отправкой</h1>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <div style={{ margin: '20px 0',  display: 'flex',  }}>
        <button 
          onClick={toggleListening}
          style={{ 
            backgroundColor: listening ? '#ff4444' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            width: '60px',
            height: '60px',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* {listening ? '⏹️ Остановить запись' : '🎤 Диктовать'} */}
          {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
        
        <button 
          onClick={handleSubmit} 
          disabled={submitting || !text}
          style={{ 
            marginLeft: '10px',
            backgroundColor: submitting ? '#999' : '#2196F3',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {submitting ? '⏳ Отправка...' : '📤 Отправить'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Основной текст:
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Результаты распознавания..."
            style={{
              width: '100%',
              height: '150px',
              padding: '10px',
              marginTop: '8px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </label>
      </div>

      <div>
        <label>
          Промежуточный текст:
          <textarea
            value={interimText}
            readOnly
            placeholder="Текст в процессе распознавания..."
            style={{
              width: '100%',
              height: '100px',
              padding: '10px',
              marginTop: '8px',
              fontSize: '16px',
              backgroundColor: '#f5f5f5',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </label>
      </div>

      {listening && (
        <div style={{ 
          marginTop: '10px', 
          color: '#4CAF50',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div className="pulsating-dot" />
          Идет запись...
        </div>
      )}
    </div>
  );
};

export default App;