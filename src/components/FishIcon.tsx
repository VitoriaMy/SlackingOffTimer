type FishIconProps = {
  className?: string;
  size?: number;
  color?: string;
};

export function FishIcon({ className, size = 18, color = "#2c2943" }: FishIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size * 0.7}
      viewBox="0 0 48 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9.5 17.1C13 11.5 18 7.8 24.6 7C27.6 6.6 30.2 6.9 33.3 8.1C36.1 9.2 38.3 10.8 40.6 13.2L44 11.3L42.4 16.4L46 18.7L40.7 19.2C39.3 23.1 36.8 25.9 33.1 27.8C30.1 29.4 27 30 23.4 29.9C20.1 29.8 16.9 29.1 13.9 27.6L13.5 31.8L10.8 28.5C8.5 28.3 6.8 27.5 5.5 26.1C4 24.5 3.2 22.6 3.1 20.4C3 18.1 3.6 16.2 5 14.6C6.2 13.3 7.7 12.4 9.8 12L9.5 17.1Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 11.6C18.2 12.7 18.8 13.9 18.9 15.3" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M21.7 9.8C23.3 11.4 24.1 13.3 24.2 15.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="31.1" cy="16" r="1.7" fill={color} />
    </svg>
  );
}