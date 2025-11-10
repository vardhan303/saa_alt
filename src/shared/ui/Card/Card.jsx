import React from 'react';
import PropTypes from 'prop-types';

// --- Card Component with Tailwind CSS ---

const CardRoot = ({ className = '', children, padding = 'p-5', ...props }) => {
  const base = 'bg-[#24283B] border border-[#3B4252] rounded-xl shadow-lg';
  return (
    <div className={`${base} ${padding} ${className}`} {...props}>
      {children}
    </div>
  );
};
CardRoot.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  padding: PropTypes.string,
};

const CardHeader = ({ className = '', children, ...props }) => (
  <div className={`border-b border-[#3B4252] mb-4 pb-3 ${className}`} {...props}>
    {children}
  </div>
);
CardHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const CardTitle = ({ className = '', children, ...props }) => (
  <h3 className={`text-xl font-bold text-[#C0CAF5] ${className}`} {...props}>
    {children}
  </h3>
);
CardTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const CardContent = ({ className = '', children, ...props }) => (
  <div className={`${className}`} {...props}>{children}</div>
);
CardContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const CardFooter = ({ className = '', children, ...props }) => (
  <div className={`border-t border-[#3B4252] mt-4 pt-3 ${className}`} {...props}>
    {children}
  </div>
);
CardFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter,
});

export default Card;