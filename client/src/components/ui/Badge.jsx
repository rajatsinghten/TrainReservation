import React from 'react';

const variants = {
  primary: 'bg-primary-50 text-primary-700',
  accent:  'bg-accent-50 text-accent-700',
  danger:  'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-700',
  neutral: 'bg-surface-100 text-surface-600',
  success: 'bg-emerald-50 text-emerald-700',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium
        ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-70`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
