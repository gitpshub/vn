import React from 'react';
import { FaRedo } from 'react-icons/fa';

interface NotificationProps {
    message: string | null;
}

const Notification:React.FC<NotificationProps> = ({message}) => {
    const handleReload = () => {
        window.location.reload();
      };
    
      return (
        <div className='message'>
          <div className='text-message'>{message}</div>
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
}

export default Notification;