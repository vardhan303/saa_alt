import React from 'react';
import PropTypes from 'prop-types';

// --- Pill Component with Tailwind CSS ---
const PILL_VARIANT_MAP = {
  default: 'bg-[#1F2335] text-[#A9B1D6]',
  primary: 'bg-blue-600/20 text-blue-400',
  success: 'bg-green-600/20 text-green-400',
  warning: 'bg-yellow-600/20 text-yellow-400',
  danger: 'bg-red-600/20 text-red-400',
  info: 'bg-purple-600/20 text-purple-400',
};

const Pill = ({
  children,
  variant = 'default',
  onClick,
  onRemove,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors';
  const classes = `${base} ${PILL_VARIANT_MAP[variant] || PILL_VARIANT_MAP.default} ${className} ${onClick ? 'cursor-pointer' : ''}`;

  return (
    <span
      className={classes}
      role={onClick ? 'button' : 'status'}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.()}}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 text-xs rounded-full p-0.5 leading-none h-4 w-4 flex items-center justify-center hover:bg-[#3B4252] hover:text-[#C0CAF5] focus:outline-none"
          aria-label="Remove pill"
        >
          &#x2715;
        </button>
      )}
    </span>
  );
};

Pill.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger', 'info']),
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
  className: PropTypes.string,
};

export default Pill;