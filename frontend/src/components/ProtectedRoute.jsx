import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return (
      <div className="empty-state" style={{ minHeight: '50vh' }}>
        <div className="empty-state-icon">🔒</div>
        <h3 className="empty-state-title">Access Denied</h3>
        <p className="empty-state-text">
          You don't have permission to access this page. Contact your administrator.
        </p>
      </div>
    );
  }

  return children;
}
