import React from 'react';

interface IslamicHilalProps {
  className?: string;
  size?: number;
}

export const IslamicHilal: React.FC<IslamicHilalProps> = ({
  className,
  size = 24,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Crescent */}
      <path
        d="M40 6C24 10 14 26 18 40C22 54 38 62 52 54C40 54 30 44 30 32C30 20 36 10 40 6Z"
        fill="currentColor"
      />

      {/* Small star */}
      <path
        d="M46 20
           L48 25
           L53 25
           L49 28
           L51 33
           L46 30
           L41 33
           L43 28
           L39 25
           L44 25
           Z"
        fill="currentColor"
      />
    </svg>
  );
};
