import React from "react";

export default function LineIcon({ style = {}, ...props }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 40 40"
      fill="none"
      {...props}
      style={style}
    >
      <circle cx="20" cy="20" r="20" fill="#06C755" />
      <path
        d="M20 10C13.373 10 8 14.477 8 20c0 3.477 2.69 6.477 6.73 8.13-.09.32-.57 2.01-.62 2.19-.1.39.14.39.29.36.12-.03 1.93-1.31 2.72-1.87C18.13 29.01 19.05 29.1 20 29.1c6.627 0 12-4.477 12-9.1S26.627 10 20 10z"
        fill="#fff"
      />
    </svg>
  );
}