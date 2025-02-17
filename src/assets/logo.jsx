import React from 'react';

const TokenWorldLogo = ({ size = 80, className = '' }) => {
  return (
    <div className={`inline-block ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
      >
        <defs>
          <linearGradient id="plasmaPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF3366' }} />
            <stop offset="100%" style={{ stopColor: '#CB5EEE' }} />
          </linearGradient>
        </defs>
        
        <circle cx="100" cy="100" r="90" fill="#13111C" />
        <circle 
          cx="100" 
          cy="100" 
          r="70" 
          fill="none" 
          stroke="url(#plasmaPurple)" 
          strokeWidth="3" 
          strokeDasharray="1 3"
        />
        <circle 
          cx="100" 
          cy="100" 
          r="35" 
          fill="url(#plasmaPurple)" 
          opacity="0.8"
        />
        <text 
          x="100" 
          y="110" 
          fontFamily="Arial, sans-serif" 
          fontSize="24" 
          fill="white" 
          textAnchor="middle"
        >
          TW
        </text>
      </svg>
    </div>
  );
};

export default TokenWorldLogo;