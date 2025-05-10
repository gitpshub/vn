import React, { useState } from 'react';
import { FaRedo } from 'react-icons/fa';

const Activation: React.FC = () => {
  const [device, setDevice] = useState<string>('');

  const handleReload = () => {
    localStorage.setItem('device', device);
    window.location.reload();
  };

  return (
    <div className='message'>
      <div className='text-message'>Device</div>
      <input
        onChange={(e) => setDevice(e.target.value)}
        style={{
          color: '#4CAF50',  
          fontSize: '24px',
          fontWeight: 'bold',
          padding: '10px',
          borderRadius: '8px',
          border: '2px solid #4CAF50'
        }}
      />
      <button
        onClick={handleReload}
        style={{
          backgroundColor: '#4CAF50',
        }}
      >
        <FaRedo />
      </button>
    </div>
  );
};

export default Activation;
