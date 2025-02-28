import React from 'react';

interface StyledButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const StyledButton: React.FC<StyledButtonProps> = ({ onClick, children, disabled }) => {
  return (
    <button
      disabled={disabled}
      className={`bg-blue-600 text-white p-3 rounded-full shadow-md hover:bg-blue-700 border-2 border-blue-800 transform hover:scale-105 transition-transform duration-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default StyledButton; 