import React from 'react';
import { FaRedo } from 'react-icons/fa';

interface ErrorFormProps {
  error: string | null;
  type: string;
}

const ErrorForm: React.FC<ErrorFormProps> = ({ error, type }) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className='error'>
      <div><b>{type}</b></div>
      <div className='error-message'>{error}</div>
      <button
        onClick={handleReload}
        style={{
          backgroundColor: 'red',
        }}
      >
        <FaRedo />
      </button>
    </div>
  );
};

export default ErrorForm;
