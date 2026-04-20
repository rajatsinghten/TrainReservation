import React from 'react';

const Avatar = ({ name, size = 'md', online, className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  // Generate a consistent color based on name
  const colors = [
    'bg-primary-100 text-primary-700',
    'bg-accent-100 text-accent-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-violet-100 text-violet-700',
    'bg-cyan-100 text-cyan-700',
  ];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center font-semibold select-none`}
      >
        {initials}
      </div>
      {typeof online === 'boolean' && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white
            ${online ? 'bg-emerald-500' : 'bg-surface-400'}
            ${size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'}`}
        />
      )}
    </div>
  );
};

export default Avatar;
