import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

const InclusiveLearningLogo: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 100 100">
      {/* Outer circle representing inclusivity */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.8"
      />
      
      {/* Inner hexagon representing AI/technology */}
      <polygon
        points="50,15 70,28 70,50 50,63 30,50 30,28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.9"
      />
      
      {/* Central brain/learning symbol */}
      <g transform="translate(50,50)">
        {/* Brain outline */}
        <path
          d="M-12,-8 Q-15,-12 -10,-15 Q-5,-18 0,-15 Q5,-18 10,-15 Q15,-12 12,-8 L12,5 Q12,10 8,12 L-8,12 Q-12,10 -12,5 Z"
          fill="currentColor"
          opacity="0.7"
        />
        
        {/* Neural connections */}
        <circle cx="-6" cy="-5" r="1.5" fill="currentColor" opacity="0.9" />
        <circle cx="6" cy="-5" r="1.5" fill="currentColor" opacity="0.9" />
        <circle cx="0" cy="-8" r="1.5" fill="currentColor" opacity="0.9" />
        <circle cx="-6" cy="2" r="1.5" fill="currentColor" opacity="0.9" />
        <circle cx="6" cy="2" r="1.5" fill="currentColor" opacity="0.9" />
        
        {/* Connection lines */}
        <line x1="-6" y1="-5" x2="0" y2="-8" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="6" y1="-5" x2="0" y2="-8" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="-6" y1="-5" x2="-6" y2="2" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="6" y1="-5" x2="6" y2="2" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="-6" y1="2" x2="6" y2="2" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      </g>
      
      {/* Three dots representing diversity/students around the logo */}
      <circle cx="25" cy="25" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="75" cy="25" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="50" cy="85" r="3" fill="currentColor" opacity="0.6" />
      
      {/* Connecting lines from center to diversity dots */}
      <line x1="40" y1="40" x2="28" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="60" y1="40" x2="72" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="50" y1="65" x2="50" y2="82" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </SvgIcon>
  );
};

export default InclusiveLearningLogo;
