import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ao carregar a página, verifica se tem login salvo
    const storedUser = localStorage.getItem('@droneApp:user');
    const storedToken = localStorage.getItem('@droneApp:token');

    if (storedUser && storedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  function login(userData, token) {
    localStorage.setItem('@droneApp:user', JSON.stringify(userData));
    localStorage.setItem('@droneApp:token', token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('@droneApp:user');
    localStorage.removeItem('@droneApp:token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}