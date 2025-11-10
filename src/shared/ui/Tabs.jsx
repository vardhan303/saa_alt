import React, { useState } from 'react';
import PropTypes from 'prop-types';

// --- Tabs Component with Tailwind CSS ---
const TabsRoot = ({ defaultIndex = 0, children, className = '' }) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <div className={`w-full ${className}`}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { activeIndex, setActiveIndex })
      )}
    </div>
  );
};
TabsRoot.propTypes = {
  defaultIndex: PropTypes.number,
  children: PropTypes.node,
  className: PropTypes.string,
};

const TabsList = ({ children, activeIndex, setActiveIndex, className = '' }) => {
  return (
    <div className={`flex border-b border-[#3B4252] ${className}`}>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, { index, activeIndex, setActiveIndex })
      )}
    </div>
  );
};
TabsList.propTypes = {
  children: PropTypes.node,
  activeIndex: PropTypes.number,
  setActiveIndex: PropTypes.func,
  className: PropTypes.string,
};

const Tab = ({ children, index, activeIndex, setActiveIndex, className = '' }) => {
  const isActive = index === activeIndex;
  const base = 'px-4 py-2 -mb-px text-sm font-medium border-b-2 focus:outline-none transition-colors';
  const activeClasses = isActive
    ? 'border-[#7AA2F7] text-[#C0CAF5]'
    : 'border-transparent text-[#787C99] hover:text-[#A9B1D6] hover:border-[#3B4252]';

  return (
    <button
      className={`${base} ${activeClasses} ${className}`}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );
};
Tab.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number,
  activeIndex: PropTypes.number,
  setActiveIndex: PropTypes.func,
  className: PropTypes.string,
};

const TabsPanel = ({ children, index, activeIndex, className = '' }) => {
  if (index !== activeIndex) return null;
  return <div className={`mt-4 ${className}`}>{children}</div>;
};
TabsPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number,
  activeIndex: PropTypes.number,
  className: PropTypes.string,
};

const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab,
  Panel: TabsPanel,
});

export default Tabs;
