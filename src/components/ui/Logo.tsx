import React from "react";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "w-12 h-12" }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className} group`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full text-current"
        fill="currentColor"
      >
        {/* Fine border lines */}
        <rect 
          x="4" 
          y="4" 
          width="92" 
          height="92" 
          stroke="currentColor" 
          strokeWidth="0.75" 
          strokeOpacity="0.8"
          fill="none"
          className="transition-transform duration-1000 ease-out origin-center group-hover:scale-[0.96]"
        />
        
        {/* Inner delicate diamond */}
        <path 
          d="M 50,7 L 93,50 L 50,93 L 7,50 Z" 
          stroke="currentColor" 
          strokeWidth="0.5" 
          strokeOpacity="0.4"
          fill="none"
          className="transition-transform duration-1000 ease-out origin-center group-hover:scale-[1.04]"
        />
        
        {/* Text Group */}
        <g className="transition-transform duration-700 origin-center group-hover:scale-105">
          <text 
            x="48" 
            y="52" 
            fontFamily="'Cormorant Garamond', serif" 
            fontSize="48" 
            fontStyle="italic" 
            fontWeight="300"
            textAnchor="end"
            dominantBaseline="middle"
          >
            S
          </text>
          <text 
            x="49" 
            y="56" 
            fontFamily="'Cormorant Garamond', serif" 
            fontSize="42" 
            fontWeight="400"
            textAnchor="start"
            dominantBaseline="middle"
          >
            E
          </text>
        </g>
      </svg>
    </div>
  );
}
