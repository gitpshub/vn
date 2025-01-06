import { useState, useEffect } from 'react'
import styles from './SpeechRecognitionApp.module.css'
import { FaMicrophone, FaMicrophoneSlash, FaPaperPlane } from 'react-icons/fa';

export default function SpeechRecognitionApp() {
  const [text, setText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'ru-RU';

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')

        setText(transcript)
      }

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error)
        setIsListening(false)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    } else {
      console.error('Speech recognition not supported')
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop()
    } else {
      recognition?.start()
    }
    setIsListening(!isListening)
  }

  const sendText = async () => {
    if (text && !isListening) {
      try {
        const response = await fetch('https://api.example.com/endpoint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        })
        if (response.ok) {
          console.log('Text sent successfully')
          setText('')
        } else {
          console.error('Failed to send text')
        }
      } catch (error) {
        console.error('Error sending text:', error)
      }
    }
  }

  return (
    <div className={styles.container}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Dictated text will appear here"
        className={`${styles.textarea} ${isListening ? styles.listening : ''}`}
      />
      <div className={styles.buttonContainer}>
        <button 
          onClick={toggleListening} 
          className={`${styles.button} ${isListening ? styles.listening : ''}`}
          title={isListening ? 'Stop Dictation' : 'Start Dictation'}
        >
          {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
        <button 
          onClick={sendText} 
          className={styles.button}
          disabled={isListening || !text}
          title="Send Text"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  )
}

