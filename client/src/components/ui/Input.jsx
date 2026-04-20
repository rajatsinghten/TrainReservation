import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  size = 'md',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-xs rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-5 py-3.5 text-base rounded-xl',
  };

  return (
    <div className={containerClassName}>
      {label && (
        <label
          className="block text-sm font-medium text-surface-700 mb-1.5"
          htmlFor={props.id}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full bg-white border transition-all duration-200
          placeholder-surface-400 text-surface-800
          focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400
          disabled:bg-surface-100 disabled:cursor-not-allowed
          ${error ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-surface-300'}
          ${sizeClasses[size]}
          ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-surface-500">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
