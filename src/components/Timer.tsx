import { useState, useEffect, useCallback } from 'react';
import { FaPlay, FaPause, FaTimes } from 'react-icons/fa';
import { requestWakeLock } from '../utils';

const Timer = () => {
  const [isTimerRun, setIsTimerRun] = useState(() => {
    const savedStatus = localStorage.getItem('timerRunning');
    return savedStatus ? JSON.parse(savedStatus) : false;
  });

  const [startTime, setStartTime] = useState(() => {
    const savedTime = localStorage.getItem('timerStartTime');
    return savedTime ? parseInt(savedTime, 10) : null;
  });

  const beepVolume = 0.05;

  useEffect(() => {
    localStorage.setItem('timerRunning', JSON.stringify(isTimerRun));
  }, [isTimerRun]);

  useEffect(() => {
    if (startTime !== null) {
      localStorage.setItem('timerStartTime', startTime.toString());
    }
  }, [startTime]);

  const getElapsedTime = useCallback((start: number | null) => {
    if (!start) return 0;
    const now = Date.now();
    localStorage.setItem('timerStopTime', now.toString());
    return now - start;
  }, []);

  const [elapsedTime, setElapsedTime] = useState(getElapsedTime(startTime));

  useEffect(() => {
    let interval = undefined;

    if (isTimerRun) {
      setElapsedTime(getElapsedTime(startTime));
      interval = setInterval(() => {
        setElapsedTime(getElapsedTime(startTime));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRun, getElapsedTime, startTime]);

  const playShortBeep = useCallback((beepVolume: number) => {
    const audioCtx = new window.AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(beepVolume, audioCtx.currentTime);
    oscillator.connect(gainNode).connect(audioCtx.destination);
    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
      audioCtx.close();
    }, 150);
  }, []);

  useEffect(() => {
    const checkInterval = 60 * 15;
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const lastCheckTime = parseInt(
      localStorage.getItem('lastCheckTime') || '0'
    );

    if (
      totalSeconds >= checkInterval &&
      totalSeconds % checkInterval === 0 &&
      totalSeconds !== lastCheckTime
    ) {
      playShortBeep(beepVolume);
      localStorage.setItem('lastCheckTime', totalSeconds.toString());
    }
  }, [elapsedTime, isTimerRun, playShortBeep, beepVolume]);

  useEffect(() => {
    if (isTimerRun) {
      requestWakeLock();
    }
  }, [isTimerRun]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      '0'
    );
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const color = isTimerRun ? '#333' : '#999';

    return (
      <>
        <span
          style={{ fontSize: '24px', fontWeight: 'bold', color: `${color}` }}
        >
          {`${hours}:${minutes}`}
        </span>
        <span
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#999',
          }}
        >
          :{seconds}
        </span>
      </>
    );
  };

  const formatRoundedTime = (ms: number) => {
    const totalMinutes = Math.ceil(ms / 1000 / 60 / 15) * 15;
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minutes = String(totalMinutes % 60).padStart(2, '0');
    const color = isTimerRun ? '#999' : '#333';

    return (
      <span
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: `${color}`,
          marginLeft: 'auto',
        }}
      >
        {hours}:{minutes}
      </span>
    );
  };

  const toggleTimer = () => {
    if (!isTimerRun) {
      setStartTime(Date.now());
      setIsTimerRun(true);
    } else {
      setIsTimerRun(false);
      setStartTime(null);
    }
  };

  const resetTimer = () => {
    setIsTimerRun(false);
    setStartTime(null);
    setElapsedTime(0);
    localStorage.removeItem('lastCheckTime');
    localStorage.removeItem('timerStartTime');
    localStorage.removeItem('timerStopTime');
  };

  return (
    <div
      className='timer'
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <button
        className={isTimerRun ? 'animate' : ''}
        onClick={toggleTimer}
        style={{
          backgroundColor: isTimerRun ? '#ff4444' : '#4CAF50',
        }}
      >
        {isTimerRun ? <FaPause /> : <FaPlay />}
      </button>
      <span style={{ userSelect: 'none' }}>{formatTime(elapsedTime)}</span>

      <span
        style={{ fontSize: '18px', fontWeight: 'bold', userSelect: 'none' }}
      >
        {formatRoundedTime(elapsedTime)}
      </span>

      <button
        onClick={resetTimer}
        style={{
          backgroundColor: '#4CAF50',
        }}
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Timer;
