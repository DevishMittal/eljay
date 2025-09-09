import React from 'react';
import { Button } from './button';

interface PrintButtonProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  onClick,
  className = '',
  children = 'Print',
  variant = 'outline',
  size = 'default',
  disabled = false
}) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      className={`print-button ${className}`}
    >
      <svg 
        className="w-4 h-4 mr-2" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" 
        />
      </svg>
      {children}
    </Button>
  );
};

export default PrintButton;
