// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user]  = useState(() => { try { return JSON.parse(localStorage.getItem('srUser')); } catch { return null; } });
  const [token] = useState(() => localStorage.getItem('srToken') || null);

  // We keep a mutable ref-style approach via a wrapper state
  const [auth, setAuth] = useState({ user, token });

  const login = (userData, jwt) => {
    localStorage.setItem('srUser',  JSON.stringify(userData));
    localStorage.setItem('srToken', jwt);
    setAuth({ user: userData, token: jwt });
  };

  const logout = () => {
    localStorage.removeItem('srUser');
    localStorage.removeItem('srToken');
    setAuth({ user: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
