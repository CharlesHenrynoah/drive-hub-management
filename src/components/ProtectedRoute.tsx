
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Si un rôle spécifique est requis et l'utilisateur n'a pas ce rôle
  if (requiredRole && user.role !== requiredRole) {
    // Rediriger vers la page appropriée en fonction du rôle de l'utilisateur
    if (user.role === "admin" && !location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin" replace />;
    } else if (user.role === "manager" && location.pathname.startsWith("/admin")) {
      return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
}
