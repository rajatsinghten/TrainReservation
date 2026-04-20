import React from 'react';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <svg
      className={`animate-spin text-primary-600 ${sizes[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
};

const LoadingScreen = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 animate-fade-in">
    <Spinner size="lg" />
    <p className="text-sm text-surface-500 font-medium">{message}</p>
  </div>
);

const SkeletonBlock = ({ className = '' }) => (
  <div className={`skeleton h-4 ${className}`} />
);

const SkeletonCard = () => (
  <div className="card p-6 space-y-4 animate-fade-in">
    <SkeletonBlock className="h-5 w-1/3" />
    <SkeletonBlock className="h-4 w-2/3" />
    <SkeletonBlock className="h-4 w-1/2" />
    <div className="flex gap-3 pt-2">
      <SkeletonBlock className="h-9 w-24 rounded-xl" />
      <SkeletonBlock className="h-9 w-24 rounded-xl" />
    </div>
  </div>
);

export { Spinner, LoadingScreen, SkeletonBlock, SkeletonCard };
