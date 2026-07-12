import { useAuth } from '../context/AuthContext';
import { IoSearchOutline, IoNotificationsOutline, IoMenuOutline, IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';
import { useState, useRef, useEffect } from 'react';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadge = (role) => {
    const labels = {
      Admin: 'Admin',
      AssetManager: 'Asset Manager',
      DeptHead: 'Dept Head',
      Employee: 'Employee',
    };
    return labels[role] || role;
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      right: 0,
      left: 'inherit',
      width: 'calc(100%)',
      height: 'var(--navbar-height)',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-6)',
      zIndex: 100,
      boxShadow: 'var(--shadow-xs)',
    }}>
      {/* Left section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <button
          className="btn-icon btn-ghost"
          onClick={onMenuToggle}
          style={{ display: 'none' }}
          id="menu-toggle-btn"
        >
          <IoMenuOutline size={22} />
        </button>

        <div style={{ position: 'relative', maxWidth: 360, flex: 1 }}>
          <IoSearchOutline
            size={18}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search assets, bookings, employees..."
            className="form-input"
            style={{
              paddingLeft: 38,
              background: 'var(--bg-main)',
              border: '1.5px solid transparent',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              width: 320,
            }}
            id="global-search-input"
          />
        </div>
      </div>

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Theme Toggle */}
        <button
          className="btn-ghost btn-icon"
          onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          id="theme-toggle-btn"
        >
          {theme === 'light' ? <IoMoonOutline size={20} color="var(--text-secondary)" /> : <IoSunnyOutline size={20} color="var(--text-secondary)" />}
        </button>

        {/* Notification Bell */}
        <button
          className="btn-ghost btn-icon"
          style={{ position: 'relative' }}
          id="notification-bell-btn"
        >
          <IoNotificationsOutline size={20} color="var(--text-secondary)" />
          <span style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 8,
            height: 8,
            background: 'var(--danger)',
            borderRadius: '50%',
            border: '2px solid var(--bg-card)',
          }}></span>
        </button>

        {/* Divider */}
        <div style={{
          width: 1,
          height: 28,
          background: 'var(--border)',
          margin: '0 var(--space-2)',
        }}></div>

        {/* User Menu */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: '6px 12px',
              border: 'none',
              background: 'transparent',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)',
            }}
            id="user-menu-btn"
            onMouseEnter={(e) => e.target.closest('button').style.background = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.target.closest('button').style.background = 'transparent'}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.8125rem',
              fontWeight: 700,
            }}>
              {getInitials(user?.name)}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {getRoleBadge(user?.role)}
              </div>
            </div>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 200,
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              animation: 'slideUp 0.15s ease',
              zIndex: 200,
            }}>
              <div style={{ padding: 'var(--space-3)' }}>
                <button
                  className="btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8125rem' }}
                  onClick={() => setShowDropdown(false)}
                  id="profile-btn"
                >
                  Profile Settings
                </button>
                <button
                  className="btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8125rem', color: 'var(--danger)' }}
                  onClick={() => { logout(); setShowDropdown(false); }}
                  id="logout-btn"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #menu-toggle-btn { display: flex !important; }
          #global-search-input { width: 180px !important; }
        }
        @media (max-width: 480px) {
          #global-search-input { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
