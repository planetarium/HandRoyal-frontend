import React, { useState } from 'react';

interface StyledButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  textColor?: string;
  bgColor?: string;
  shadowColor?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const StyledButton: React.FC<StyledButtonProps> = ({
  onClick,
  children,
  disabled = false,
  textColor = '#000000',
  bgColor = '#40C4FF',
  shadowColor = '#0288D1',
  className = '',
  type = 'button'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={className}
      disabled={disabled}
      type={type}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0.75rem 1.2rem',
        color: disabled ? '#333333' : textColor,
        backgroundColor: disabled ? '#6A6A6A' : bgColor,
        border: `2px solid ${disabled ? '#555555' : '#1a1b23'}`,
        borderRadius: '0.5rem',
        boxShadow: disabled
          ? 'inset 0 -3px 0 0 #555555, inset 0 1px 0 0 rgba(255,255,255,0.2)'
          : isHovered
          ? `inset 0 -3px 0 0 ${shadowColor}, inset 0 1px 0 0 rgba(255,255,255,0.3)`
          : `inset 0 -4px 0 0 ${shadowColor}, inset 0 1px 0 0 rgba(255,255,255,0.3)`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.8 : 1,
        transition: 'all 0.2s',
        textShadow: disabled ? '0 1px 0 rgba(255,255,255,0.2)' : `-1px -1px 0 ${shadowColor}`,
        transform: isHovered ? 'translateY(1px)' : 'translateY(0)',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
};

export default StyledButton; 