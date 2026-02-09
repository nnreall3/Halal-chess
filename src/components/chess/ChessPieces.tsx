import React from 'react';
import { PieceType, PieceColor } from '@/lib/chess';
import { cn } from '@/lib/utils';

interface ChessPieceProps {
  type: PieceType;
  color: PieceColor;
  size?: number;
  className?: string;
}

// Islamic-friendly chess pieces with geometric designs
// - King: Geometric dome crown instead of cross
// - Knight: Abstract geometric shape instead of horse

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, size, className }) => {
  const isWhite = color === 'white';
  // Enhanced colors for better visibility
  const fill = isWhite ? '#fefcf9' : '#1a1816';
  const stroke = isWhite ? '#3d3a37' : '#e8e4df';
  const strokeWidth = 2;
  const highlight = isWhite ? '#d4d0c8' : '#4a4540';

  const commonProps = {
    viewBox: '0 0 48 48',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className: cn('drop-shadow-sm', className),
    style: size ? { width: size, height: size } : undefined,
  };

  switch (type) {
    case 'king':
      // Islamic-friendly King with geometric dome crown (no cross)
      return (
        <svg {...commonProps}>
          {/* Base */}
          <ellipse cx="24" cy="42" rx="14" ry="4" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="10" y="36" width="28" height="6" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Body */}
          <path d="M14 36 L14 28 Q14 22 24 20 Q34 22 34 28 L34 36" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Crown base */}
          <rect x="16" y="16" width="16" height="4" rx="1" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Geometric dome (Islamic arch style) - replaces cross */}
          <path d="M18 16 L18 12 Q18 6 24 4 Q30 6 30 12 L30 16" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Decorative geometric star at top */}
          <circle cx="24" cy="8" r="2" fill={stroke} />
          
          {/* Decorative bands */}
          <path d="M16 30 L32 30" stroke={stroke} strokeWidth={strokeWidth} />
          <path d="M17 26 L31 26" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );

    case 'queen':
      return (
        <svg {...commonProps}>
          {/* Base */}
          <ellipse cx="24" cy="42" rx="12" ry="4" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="12" y="36" width="24" height="6" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Body */}
          <path d="M15 36 L15 20 Q15 18 24 16 Q33 18 33 20 L33 36" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Crown points - geometric style */}
          <path d="M14 16 L17 8 L20 14 L24 6 L28 14 L31 8 L34 16 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
          
          {/* Decorative gem */}
          <circle cx="24" cy="12" r="2" fill={stroke} />
          
          {/* Decorative bands */}
          <path d="M17 28 L31 28" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );

    case 'rook':
      return (
        <svg {...commonProps}>
          {/* Base */}
          <ellipse cx="24" cy="42" rx="11" ry="4" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="13" y="36" width="22" height="6" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Tower body */}
          <rect x="15" y="18" width="18" height="18" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Battlements */}
          <rect x="13" y="10" width="6" height="8" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="21" y="10" width="6" height="8" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="29" y="10" width="6" height="8" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Door/window detail */}
          <rect x="21" y="26" width="6" height="10" rx="3" fill={stroke} fillOpacity="0.3" />
        </svg>
      );

    case 'bishop':
      return (
        <svg {...commonProps}>
          {/* Base */}
          <ellipse cx="24" cy="42" rx="10" ry="4" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="14" y="36" width="20" height="6" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Body */}
          <path d="M17 36 L17 28 Q17 24 24 22 Q31 24 31 28 L31 36" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Mitre (bishop's hat) - geometric style */}
          <path d="M18 22 L24 6 L30 22 Q30 24 24 26 Q18 24 18 22 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Decorative line on mitre */}
          <path d="M24 8 L24 20" stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Collar */}
          <ellipse cx="24" cy="25" rx="5" ry="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );

    case 'knight':
      // Abstract geometric knight - avoids depicting living creature
      return (
        <svg {...commonProps}>
          {/* Base */}
          <ellipse cx="24" cy="42" rx="10" ry="4" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="14" y="36" width="20" height="6" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Geometric abstract shape - angular/crystalline */}
          <path 
            d="M16 36 L16 28 L20 24 L18 16 L24 10 L30 16 L28 24 L32 28 L32 36" 
            fill={fill} 
            stroke={stroke} 
            strokeWidth={strokeWidth} 
            strokeLinejoin="round"
          />
          
          {/* Inner geometric details */}
          <path d="M21 28 L24 22 L27 28" stroke={stroke} strokeWidth={strokeWidth} fill="none" />
          <circle cx="24" cy="14" r="2" fill={stroke} />
          
          {/* Decorative facets */}
          <path d="M20 24 L24 20 L28 24" stroke={stroke} strokeWidth="1" strokeOpacity="0.5" fill="none" />
        </svg>
      );

    case 'pawn':
      return (
        <svg {...commonProps}>
          {/* Base */}
          <ellipse cx="24" cy="42" rx="9" ry="3" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="15" y="36" width="18" height="6" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Body - tapered */}
          <path d="M18 36 L20 28 L28 28 L30 36" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Collar */}
          <ellipse cx="24" cy="28" rx="5" ry="2" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Head - geometric sphere */}
          <circle cx="24" cy="18" r="8" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          
          {/* Decorative line */}
          <path d="M20 28 L28 28" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );

    default:
      return null;
  }
};

export default ChessPiece;