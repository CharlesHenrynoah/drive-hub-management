
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasFinanceAccess: boolean;
  isLoading: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Dans une application réelle, cela serait basé sur le rôle de l'utilisateur
  // Pour la démo, nous définissons simplement cette valeur
  const hasFinanceAccess = true;

  // Check for existing session on mount
  useEffect(() => {
    async function checkSession() {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: "Jean Dupont",
            email: session.user.email || "jean.dupont@exemple.fr",
            role: "manager",
          });
        } else if (location.pathname !== "/login") {
          navigate("/login");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        navigate("/login");
      } else if (event === "SIGNED_IN" && session) {
        setUser({
          id: session.user.id,
          name: "Jean Dupont",
          email: session.user.email || "jean.dupont@exemple.fr",
          role: "manager",
        });
        
        if (location.pathname === "/login") {
          navigate("/");
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  async function login(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      navigate("/");
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw error;
    }
  }

  function logout() {
    supabase.auth.signOut().then(() => {
      navigate("/login");
    });
  }

  const value = {
    user,
    login,
    logout,
    hasFinanceAccess,
    isLoading,
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
