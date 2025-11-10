import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

// --- Modal Component with Tailwind CSS ---
const Modal = ({ open, onClose, title, children, footer, className = '', size = 'xl' }) => {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-[90vw]'
  };

  const resolvedSize = sizeClasses[size] || sizeClasses.xl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-[#1A1B26] bg-opacity-70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-[#24283B] border border-[#3B4252] rounded-lg shadow-lg ${resolvedSize} w-full p-6 z-10 ${className}`}
      >
        {title && (
          <h2 className="text-lg font-semibold text-[#C0CAF5] mb-4">
            {title}
          </h2>
        )}
        <div className="text-[#A9B1D6]">{children}</div>
        {footer && <div className="mt-6">{footer}</div>}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#787C99] hover:text-[#C0CAF5]"
          aria-label="Close modal"
          type="button"
        >
          &#x2715;
        </button>
      </div>
    </div>
  );
};

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm','md','lg','xl','2xl','3xl','4xl','5xl','full'])
};

export default Modal;
