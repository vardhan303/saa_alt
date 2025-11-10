import React from 'react';
import './OrbitProgress.css';

const OrbitProgress = ({ 
  variant = 'track-disc', 
  speedPlus = '0', 
  easing = 'linear',
  size = 'md',
  color = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary', 
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger'
  };

  // Calculate animation duration based on speedPlus
  const baseSpeed = 2; // base 2 seconds
  const speed = Math.max(0.5, baseSpeed + parseInt(speedPlus || 0) * 0.1);
  
  const animationStyle = {
    '--orbit-duration': `${speed}s`,
    '--orbit-easing': easing
  };

  const renderTrackDisc = () => (
    <div 
      className={`orbit-progress orbit-track-disc ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      style={animationStyle}
    >
      {/* Outer track */}
      <div className="orbit-track"></div>
      
      {/* Orbiting elements */}
      <div className="orbit-element orbit-element-1">
        <div className="orbit-disc"></div>
      </div>
      <div className="orbit-element orbit-element-2">
        <div className="orbit-disc orbit-disc-small"></div>
      </div>
      <div className="orbit-element orbit-element-3">
        <div className="orbit-disc orbit-disc-tiny"></div>
      </div>
      
      {/* Center element */}
      <div className="orbit-center">
        <div className="orbit-center-disc"></div>
      </div>
    </div>
  );

  const renderSpinner = () => (
    <div 
      className={`orbit-progress orbit-spinner ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      style={animationStyle}
    >
      <div className="orbit-spinner-ring"></div>
    </div>
  );

  const renderPulse = () => (
    <div 
      className={`orbit-progress orbit-pulse ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      style={animationStyle}
    >
      <div className="orbit-pulse-ring orbit-pulse-ring-1"></div>
      <div className="orbit-pulse-ring orbit-pulse-ring-2"></div>
      <div className="orbit-pulse-ring orbit-pulse-ring-3"></div>
    </div>
  );

  const renderDots = () => (
    <div 
      className={`orbit-progress orbit-dots ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      style={animationStyle}
    >
      <div className="orbit-dot orbit-dot-1"></div>
      <div className="orbit-dot orbit-dot-2"></div>
      <div className="orbit-dot orbit-dot-3"></div>
    </div>
  );

  switch (variant) {
    case 'track-disc':
      return renderTrackDisc();
    case 'spinner':
      return renderSpinner();
    case 'pulse':
      return renderPulse();
    case 'dots':
      return renderDots();
    default:
      return renderTrackDisc();
  }
};

export default OrbitProgress;