import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Decode JWT payload (no verification) to provide immediate user info
  const decodeJwt = (jwt) => {
    try {
      const payload = jwt.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (err) {
      return null;
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      // debug: show token and the request target
      console.debug('[Auth] fetchUser: token=', token, 'request=', `${api.defaults.baseURL}/auth/me`);
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error?.response?.status, error?.response?.data || error.message || error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // stabilize functions so their identity doesn't change on every render
  const login = useCallback((newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);

    // optimistic user set from token payload so UI can update immediately
    const decoded = decodeJwt(newToken);
    if (decoded) {
      const previewUser = {
        id: decoded.id || decoded.userId || decoded.sub,
        email: decoded.email,
        name: decoded.name || decoded.username || decoded.fullname,
      };
      setUser(previewUser);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    token,
    isAuthenticated: !!token,
    login,
    logout,
  }), [user, loading, token, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};