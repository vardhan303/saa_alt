import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// --- Dropdown Component with Tailwind CSS ---
const DropdownRoot = ({ trigger, children, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer focus:outline-none">
        {trigger}
      </div>
      {open && (
        <div className="absolute right-0 mt-2 min-w-[9rem] max-w-[11rem] bg-[#24283B] border border-[#3B4252] rounded-xl shadow-xl z-50 animate-in fade-in zoom-in duration-150">
          <ul className="py-2 px-1 space-y-1">{children}</ul>
        </div>
      )}
    </div>
  );
};

DropdownRoot.propTypes = {
  trigger: PropTypes.node.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};


const DropdownItem = ({ children, onClick, as, to, className = '', ...props }) => {
  const baseClass =
    'block w-full px-4 py-2 text-sm text-[#A9B1D6] rounded-lg text-center transition-colors duration-100 focus:outline-none focus:bg-[#1F2335] hover:bg-[#1F2335]';
  if (as) {
    const Component = as;
    return (
      <li>
        <Component
          to={to}
          onClick={onClick}
          className={`${baseClass} ${className}`}
          {...props}
        >
          {children}
        </Component>
      </li>
    );
  }
  return (
    <li>
      <button
        onClick={onClick}
        className={`${baseClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    </li>
  );
};

DropdownItem.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  as: PropTypes.elementType,
  to: PropTypes.string,
  className: PropTypes.string,
};

const Dropdown = Object.assign(DropdownRoot, {
  Item: DropdownItem,
});

export default Dropdown;
