
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: string) => Promise<void>;
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
  const hasFinanceAccess = true;

  // Check for existing session on mount
  useEffect(() => {
    async function checkSession() {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Session trouvée:", session.user);
          const userRole = session.user.user_metadata?.role || "manager";
          
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || "Jean Dupont",
            email: session.user.email || "jean.dupont@exemple.fr",
            role: userRole,
          });
          
          // If logged in and on login page, redirect based on role
          if (location.pathname === "/login") {
            if (userRole === "admin") {
              navigate("/admin");
            } else {
              navigate("/");
            }
          }
        } else if (location.pathname !== "/login") {
          navigate("/login");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    }
    
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session?.user);
      
      if (event === "SIGNED_OUT") {
        setUser(null);
        navigate("/login");
      } else if (event === "SIGNED_IN" && session) {
        const userRole = session.user.user_metadata?.role || "manager";
        
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || "Jean Dupont",
          email: session.user.email || "jean.dupont@exemple.fr",
          role: userRole,
        });
        
        if (location.pathname === "/login") {
          if (userRole === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  async function login(email: string, password: string, role?: string) {
    try {
      console.log(`Tentative de connexion avec: ${email}, rôle: ${role || "manager"}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          data: {
            role: role || "manager",
          }
        }
      });
      
      if (error) {
        console.error("Erreur de connexion:", error);
        throw error;
      }
      
      if (data.user) {
        console.log("Connexion réussie:", data.user);
        
        const userRole = data.user.user_metadata?.role || role || "manager";
        
        // Rediriger en fonction du rôle
        if (userRole === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
        return;
      }
      
      throw new Error("Aucun utilisateur retourné après la connexion");
    } catch (error: any) {
      console.error("Erreur de connexion détaillée:", error);
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
