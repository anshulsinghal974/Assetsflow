import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Allocation from './pages/Allocation';
import Booking from './pages/Booking';
import Maintenance from './pages/Maintenance';
import Departments from './pages/Departments';
import Categories from './pages/Categories';
import Employees from './pages/Employees';
import Audit from './pages/Audit';
import { useState } from 'react';

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`main-area ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Navbar onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="page-content">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assets" element={<Assets />} />
            <Route path="allocation" element={<Allocation />} />
            <Route path="booking" element={<Booking />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="departments" element={
              <ProtectedRoute roles={['Admin']}>
                <Departments />
              </ProtectedRoute>
            } />
            <Route path="categories" element={
              <ProtectedRoute roles={['Admin', 'AssetManager']}>
                <Categories />
              </ProtectedRoute>
            } />
            <Route path="employees" element={
              <ProtectedRoute roles={['Admin']}>
                <Employees />
              </ProtectedRoute>
            } />
            <Route path="audit" element={
              <ProtectedRoute roles={['Admin', 'AssetManager']}>
                <Audit />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
