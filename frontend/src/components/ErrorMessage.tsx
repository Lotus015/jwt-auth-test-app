interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-md flex items-start gap-3">
      {/* Error icon */}
      <svg
        className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      {/* Message */}
      <span className="flex-1 text-sm">{message}</span>

      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors p-0.5 rounded hover:bg-red-100"
          aria-label="Dismiss error"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
