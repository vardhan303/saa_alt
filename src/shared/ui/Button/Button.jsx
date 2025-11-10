import React from 'react';
import PropTypes from 'prop-types';

// For the custom "Tokyo Night" colors, it uses Tailwind's arbitrary value syntax.
// Assumes the 'Playfair Display' font is loaded globally (e.g., in index.html).

// --- Button Component with Tailwind CSS ---

const VARIANT_MAP = {
  primary: 'bg-[#7AA2F7] text-[#1A1B26] shadow-[0px_4px_15px_-5px_#7AA2F766] hover:opacity-95',
  secondary: 'border border-[#3B4252] bg-transparent text-[#A9B1D6] hover:bg-[#24283B]',
  danger: 'bg-[#F7768E] text-[#C0CAF5] hover:brightness-90',
  ghost: 'bg-transparent text-[#A9B1D6] hover:bg-[#1F2335]',
};

const SIZE_MAP = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-lg font-semibold transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed';
  
  const classes = `${baseClasses} ${VARIANT_MAP[variant]} ${SIZE_MAP[size]} ${className}`;

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
      ) : (
        children
      )}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Button;