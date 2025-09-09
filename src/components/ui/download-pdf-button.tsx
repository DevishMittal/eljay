import React from 'react';
import { Button } from './button';

interface DownloadPDFButtonProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
}

export const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({
  onClick,
  className = '',
  children = 'Download PDF',
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
      className={`download-pdf-button ${className}`}
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
          d="M12 15V3" 
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" 
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="m7 10 5 5 5-5" 
        />
      </svg>
      {children}
    </Button>
  );
};

export default DownloadPDFButton;
