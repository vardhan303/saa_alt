
import React from 'react';
import PropTypes from 'prop-types';

// --- Input Component with Tailwind CSS ---

const Input = ({
  label,
  error,
  helperText,
  containerClassName = '',
  className = '',
  id,
  as = 'input', // 'input' | 'textarea'
  rows = 3,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const base =
    'w-full bg-[#1F2335] rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-[#7AA2F7]/40';
  const errorClasses = error
    ? 'border-red-500 text-red-500 focus:ring-red-400/40'
    : 'border-[#3B4252] text-[#A9B1D6]';

  const Element = as === 'textarea' ? 'textarea' : 'input';

  return (
    <div className={`flex flex-col ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="mb-1 text-sm font-medium text-[#C0CAF5]">
          {label}
        </label>
      )}
      <Element
        id={inputId}
        className={`${base} ${errorClasses} ${className} ${as === 'textarea' ? 'min-h-[120px] resize-y' : ''}`}
        rows={as === 'textarea' ? rows : undefined}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1 text-xs text-[#787C99]">{helperText}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  containerClassName: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  as: PropTypes.oneOf(['input','textarea']),
  rows: PropTypes.number,
};

export default Input;