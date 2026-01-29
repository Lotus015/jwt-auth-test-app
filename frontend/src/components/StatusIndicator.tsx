type Status = 'pass' | 'fail' | 'pending';

interface StatusIndicatorProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function StatusIndicator({ status, size = 'md', className = '' }: StatusIndicatorProps) {
  const sizeClass = sizeStyles[size];

  if (status === 'pass') {
    return (
      <svg
        className={`${sizeClass} text-green-500 ${className}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-label="Pass"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    );
  }

  if (status === 'fail') {
    return (
      <svg
        className={`${sizeClass} text-red-500 ${className}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-label="Fail"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );
  }

  // pending - gray circle
  return (
    <svg
      className={`${sizeClass} text-gray-400 ${className}`}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-label="Pending"
    >
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
