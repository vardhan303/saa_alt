import React, { useEffect, useRef, useState } from 'react';
import Dropdown from '../ui/Dropdown.jsx';
import './Navigation.css';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Avatar } from '../ui/Avatar.jsx';
// Removed unused Button import after introducing custom menu trigger

export default function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setScrolled(y > 16); // threshold
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (!menuRef.current || menuRef.current.contains(e.target) || buttonRef.current?.contains(e.target)) return;
      setMenuOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);


  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Base classes for nav container
  const islandNav = 'absolute top-4 left-1/2 px-4 w-[94%] max-w-5xl rounded-2xl bg-surface/80 backdrop-blur-md border border-border shadow-lg';
  const fullNav = 'fixed top-0 left-0 w-full bg-surface/95 backdrop-blur border-b border-border shadow-sm';


  return (
  <nav className={`nav-morph ${scrolled ? 'scrolled '+ fullNav : 'island '+ islandNav} ${scrolled ? '' : '-translate-x-1/2'} z-50`}>      
  <div className={`mx-auto pl-3 pr-2 sm:pl-4 sm:pr-3 lg:pl-6 lg:pr-4 ${scrolled ? 'max-w-6xl' : 'max-w-none'} relative`}>
        <div className="flex items-center h-16 w-full">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-text-primary">
              SAA Alt
            </Link>
          </div>
          <div className="flex-1" />

          {/* User Menu */}
          <div className="relative flex items-center ml-auto">
            <Dropdown
              trigger={<Avatar src={user?.photo} name={user?.displayName || user?.name} size="md" className="w-9 h-9 cursor-pointer" />}
              className=""
            >
              <Dropdown.Item as={Link} to="/hackathons">
                Hackathons
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/my-hackathons">
                My Teams
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/devpost-hackathons">
                Devpost Hackathons
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/profile">
                Profile
              </Dropdown.Item>
              <Dropdown.Item onClick={logout} className="text-danger hover:bg-danger/10">
                Sign Out
              </Dropdown.Item>
            </Dropdown>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="grid grid-cols-3 gap-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium text-center transition-colors ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              {/* Dashboard removed */}
            </Link>
            <Link
              to="/hackathons"
              className={`px-3 py-2 rounded-md text-sm font-medium text-center transition-colors ${
                isActive('/hackathons')
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              Hackathons
            </Link>
            <Link
              to="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium text-center transition-colors ${
                isActive('/profile')
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}