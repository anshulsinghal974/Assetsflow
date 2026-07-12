import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IoGridOutline,
  IoCubeOutline,
  IoSwapHorizontalOutline,
  IoCalendarOutline,
  IoConstructOutline,
  IoPeopleOutline,
  IoBusinessOutline,
  IoLayersOutline,
  IoShieldCheckmarkOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from 'react-icons/io5';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: IoGridOutline, roles: null },
  { path: '/assets', label: 'Assets', icon: IoCubeOutline, roles: null },
  { path: '/allocation', label: 'Allocation', icon: IoSwapHorizontalOutline, roles: null },
  { path: '/booking', label: 'Booking', icon: IoCalendarOutline, roles: null },
  { path: '/maintenance', label: 'Maintenance', icon: IoConstructOutline, roles: null },
  { divider: true },
  { path: '/departments', label: 'Departments', icon: IoBusinessOutline, roles: ['Admin'] },
  { path: '/categories', label: 'Categories', icon: IoLayersOutline, roles: ['Admin', 'AssetManager'] },
  { path: '/employees', label: 'Employees', icon: IoPeopleOutline, roles: ['Admin'] },
  { path: '/audit', label: 'Audit', icon: IoShieldCheckmarkOutline, roles: ['Admin', 'AssetManager'] },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter(item => {
    if (item.divider) return true;
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width var(--transition-base)',
      zIndex: 150,
      overflow: 'hidden',
    }}>
      {/* Brand */}
      <div style={{
        height: 'var(--navbar-height)',
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? '0 16px' : '0 24px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        gap: 'var(--space-3)',
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>A</span>
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <span style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              Asset<span style={{ color: 'var(--primary)' }}>Flow</span>
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: 'var(--space-4) var(--space-3)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {filteredItems.map((item, i) => {
            if (item.divider) {
              return (
                <div key={`divider-${i}`} style={{
                  height: 1,
                  background: 'var(--border-light)',
                  margin: 'var(--space-3) var(--space-2)',
                }}></div>
              );
            }

            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path === '/dashboard' && location.pathname === '/');

            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: collapsed ? '10px 16px' : '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--bg-active)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
                id={`nav-${item.label.toLowerCase()}`}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div style={{
        padding: 'var(--space-3)',
        borderTop: '1px solid var(--border-light)',
        flexShrink: 0,
      }}>
        <button
          onClick={onToggle}
          className="btn-ghost"
          style={{
            width: '100%',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 'var(--space-3)',
            fontSize: '0.8125rem',
          }}
          id="sidebar-collapse-btn"
        >
          {collapsed ? <IoChevronForwardOutline size={18} /> : (
            <>
              <IoChevronBackOutline size={18} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
