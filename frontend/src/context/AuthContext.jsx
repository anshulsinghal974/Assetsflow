import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('af_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Try to load user from localStorage
      const storedUser = localStorage.getItem('af_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          logout();
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('af_token', newToken);
    localStorage.setItem('af_user', JSON.stringify(userData));
    return userData;
  };

  const signup = async (data) => {
    const res = await authAPI.signup(data);
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('af_token', newToken);
    localStorage.setItem('af_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('af_token');
    localStorage.removeItem('af_user');
  };

  const isAdmin = () => user?.role === 'Admin';
  const isAssetManager = () => user?.role === 'AssetManager' || user?.role === 'Admin';
  const isDeptHead = () => user?.role === 'DeptHead' || isAssetManager();
  const hasRole = (...roles) => roles.includes(user?.role);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      signup,
      logout,
      isAdmin,
      isAssetManager,
      isDeptHead,
      hasRole,
      isAuthenticated: !!token && !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
