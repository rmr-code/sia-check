import { createContext, useState, useContext } from 'react';

// Create context
const AuthContext = createContext();

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component to wrap the app
export function AuthProvider({ children }) {
  
  const [isAdminPasswordSet, setIsAdminPasswordSet] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Wrap the app in this provider and expose the state to all children
  return (
    <AuthContext.Provider value={{ isAdminPasswordSet, setIsAdminPasswordSet, isLoggedIn, setIsLoggedIn}}>
      {children}
    </AuthContext.Provider>
  );
}
