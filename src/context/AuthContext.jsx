import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função SEGURA para decodificar JWT
  function parseJwt(token) {
    try {
      if (!token || typeof token !== 'string') return null;
      
      // Verifica se o token tem o formato JWT (3 partes separadas por ponto)
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const base64Url = parts[1];
      
      // Substitui caracteres específicos do base64url
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Padding para base64
      const padLength = 4 - (base64.length % 4);
      const paddedBase64 = padLength < 4 ? base64 + '='.repeat(padLength) : base64;
      
      // Decodificação segura
      const jsonPayload = decodeURIComponent(
        atob(paddedBase64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (e) {
      // Silencioso para não poluir console
      return null;
    }
  }

  useEffect(() => {
    const loadStorageData = () => {
      try {
        const storedUser = localStorage.getItem('@droneApp:user');
        const storedToken = localStorage.getItem('@droneApp:token');

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          
          // Verifica token
          const decodedToken = parseJwt(storedToken);
          
          if (!decodedToken) {
            console.log("Token inválido. Deslogando...");
            throw new Error("Token inválido");
          }
          
          // Verifica expiração
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp && decodedToken.exp < currentTime) {
            console.log("Token expirado. Deslogando...");
            throw new Error("Token expired");
          }

          setUser(parsedUser);
        }
      } catch (error) {
        console.log("Limpando dados inválidos...");
        localStorage.removeItem('@droneApp:user');
        localStorage.removeItem('@droneApp:token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Adiciona um pequeno delay para garantir que o DOM está pronto (especialmente para Safari)
    setTimeout(loadStorageData, 100);
  }, []);

  const login = (userData, token) => {
    try {
      localStorage.setItem('@droneApp:user', JSON.stringify(userData));
      localStorage.setItem('@droneApp:token', token);
      setUser(userData);
    } catch (error) {
      console.error("Erro ao salvar login", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('@droneApp:user');
    localStorage.removeItem('@droneApp:token');
    setUser(null);
    window.location.href = '/login'; // Redirecionamento forçado
  };

  return (
    <AuthContext.Provider value={{ 
      signed: !!user, 
      user, 
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
