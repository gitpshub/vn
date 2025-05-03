import { useState, useCallback } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { FaMicrophone, FaMicrophoneSlash, FaPaperPlane, FaTrash, FaRedo } from 'react-icons/fa';

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

  const handleTrash = () => {
    setText("");
  }

  const handleReload = () => {
    window.location.reload();
  }

  return (
    <div className='main'>
   
      { error && 
        <div>
          <button
            onClick={handleReload}
            style={{ 
              backgroundColor: 'red',
              width: '100%',
              borderRadius: '32px'
            }}
          >
            <FaRedo/>{error}
          </button>
        </div>
      } 
      
      <div className='buttons'>
        <button 
          onClick={toggleListening}
          style={{ 
            backgroundColor: listening ? '#ff4444' : '#4CAF50',
          }}
        >
          {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
        
        <button 
          onClick={handleSubmit} 
          disabled={submitting || !text}
          style={{ 
            backgroundColor: submitting ? '#999' : '#2196F3',
          }}
        >
          {submitting ? <FaPaperPlane/> : <FaPaperPlane/>} 
        </button>

        <button
          onClick={handleTrash}
          style={{ 
          backgroundColor: '#4CAF50',
        }}
        >
          <FaTrash/>
        </button>  

      </div>

      <div className="texts">  
      <div style={{ marginBottom: '20px' }}>
        {/* <label>
          Окончательный текст: */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Результаты распознавания..."
            style={{
              width: '100%',
              height: '100%',
              padding: '10px',
              marginTop: '8px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        {/* </label> */}
      </div>

      <div>
        {/* <label>
          Промежуточный текст: */}
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
        {/* </label> */}
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

    </div>
  );
};

export default App;