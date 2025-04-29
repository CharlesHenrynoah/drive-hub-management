
import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasFinanceAccess: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Simuler un utilisateur déjà connecté pour la démo
    return {
      id: "user-001",
      name: "Jean Dupont",
      email: "jean.dupont@exemple.fr",
      role: "manager",
    };
  });

  // Dans une application réelle, cela serait basé sur le rôle de l'utilisateur
  // Pour la démo, nous définissons simplement cette valeur
  const hasFinanceAccess = true;

  async function login(email: string, password: string) {
    // Simulation d'une API d'authentification
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUser({
          id: "user-001",
          name: "Jean Dupont",
          email: email,
          role: "manager",
        });
        resolve();
      }, 500);
    });
  }

  function logout() {
    setUser(null);
  }

  const value = {
    user,
    login,
    logout,
    hasFinanceAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}
