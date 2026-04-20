import React from 'react';

const variants = {
  primary:   'bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500',
  secondary: 'bg-surface-100 text-surface-700 shadow-xs hover:bg-surface-200 active:bg-surface-300 focus-visible:ring-surface-400',
  accent:    'bg-accent-600 text-white shadow-sm hover:bg-accent-700 active:bg-accent-800 focus-visible:ring-accent-500',
  danger:    'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500',
  ghost:     'bg-transparent text-surface-600 hover:bg-surface-100 active:bg-surface-200 focus-visible:ring-surface-400',
  outline:   'border border-surface-300 bg-white text-surface-700 hover:bg-surface-50 active:bg-surface-100 focus-visible:ring-primary-500',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1',
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3 text-base rounded-xl gap-2',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none
        ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
