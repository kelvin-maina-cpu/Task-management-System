import React from 'react';
import './Loader.css';  // We'll create this

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="svg-frame">
        {/* Layer 1 - Outer ring */}
        <svg style={{'--i': 0, '--j': 0} as React.CSSProperties}>
          <defs>
            <mask id="path-1-inside-1_111_3212">
              <rect x="0" y="0" width="344" height="344" fill="white"/>
              <path d="M72 172C72 116.772 116.772 72 172 72C227.228 72 272 116.772 272 172C272 227.228 227.228 272 172 272C116.772 272 72 227.228 72 172ZM197.322 172C197.322 158.015 185.985 146.678 172 146.678C158.015 146.678 146.678 158.015 146.678 172C146.678 185.985 158.015 197.322 172 197.322C185.985 197.322 197.322 185.985 197.322 172Z"/>
            </mask>
          </defs>
          <g id="out1">
            <path d="M72 172C72 116.772 116.772 72 172 72C227.228 72 272 116.772 272 172C272 227.228 227.228 272 172 272C116.772 272 72 227.228 72 172ZM197.322 172C197.322 158.015 185.985 146.678 172 146.678C158.015 146.678 146.678 158.015 146.678 172C146.678 185.985 158.015 197.322 172 197.322C185.985 197.322 197.322 185.985 197.322 172Z" />
            <path mask="url(#path-1-inside-1_111_3212)" strokeMiterlimit={16} strokeWidth={2} stroke="#00FFFF" d="M72 172C72 116.772 116.772 72 172 72C227.228 72 272 116.772 272 172C272 227.228 227.228 272 172 272C116.772 272 72 227.228 72 172ZM197.322 172C197.322 158.015 185.985 146.678 172 146.678C158.015 146.678 146.678 158.015 146.678 172C146.678 185.985 158.015 197.322 172 197.322C185.985 197.322 197.322 185.985 197.322 172Z" />
          </g>
        </svg>
        
        {/* Simplified layers for demo - add more as needed */}
        <svg style={{'--i': 1, '--j': 1} as React.CSSProperties}>
          <g id="out2">
            <path stroke="#00FFFF" strokeWidth="1.5" d="M100 100 Q 150 50 200 100 T 300 100" fill="none"/>
          </g>
        </svg>
        
        <svg style={{'--i': 0, '--j': 2} as React.CSSProperties}>
          <g id="inner3">
            <circle cx="172" cy="172" r="40" stroke="#ff0" strokeWidth="2" fill="none"/>
          </g>
        </svg>
        
        <svg style={{'--i': 2, '--j': 4} as React.CSSProperties}>
          <circle cx="172" cy="172" r="15" fill="#00FFFF"/>
        </svg>
      </div>
    </div>
  );
};

export default Loader;

