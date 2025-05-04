import React from 'react';
import { FaRedo } from 'react-icons/fa';

interface ErrorFormProps {
  error: string | null;
}

const ErrorForm: React.FC<ErrorFormProps> = ({ error }) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className='error'>
      <div><b>Ошибка распознавания</b></div>
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
