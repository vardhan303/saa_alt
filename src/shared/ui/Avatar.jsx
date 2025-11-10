import React, { useState } from 'react';

/**
 * Avatar component
 * Props:
 *  - src: image URL
 *  - name: user name (used for alt + fallback initial)
 *  - size: tailwind size key (sm, md, lg, xl)
 *  - className: extra classes
 */
const sizeMap = {
  sm: { box: 'w-8 h-8 text-sm', font: 'text-sm' },
  md: { box: 'w-10 h-10 text-base', font: 'text-base' },
  lg: { box: 'w-12 h-12 text-lg', font: 'text-lg' },
  xl: { box: 'w-16 h-16 text-2xl', font: 'text-2xl' }
};

export function Avatar({ src, name = 'User', size = 'md', className = '' }) {
  const [errored, setErrored] = useState(false);
  const initial = (name || 'U').trim().charAt(0).toUpperCase();
  const sz = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-surface-3 overflow-hidden select-none ${sz.box} ${className}`}
      aria-label={name}
      role="img"
    >
      {!errored && src && (
        <img
          src={src}
          alt={name}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      )}
      {(errored || !src) && (
        <span className={`font-semibold text-text-muted ${sz.font}`}>{initial}</span>
      )}
    </div>
  );
}

export default Avatar;
