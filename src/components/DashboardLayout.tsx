
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  let pageTitle = "Tableau de bord";
  
  if (location.pathname === "/vehicules") {
    pageTitle = "Gestion des Véhicules";
  } else if (location.pathname === "/chauffeurs") {
    pageTitle = "Gestion des Chauffeurs";
  } else if (location.pathname === "/flottes") {
    pageTitle = "Gestion des Flottes";
  } else if (location.pathname === "/entreprises") {
    pageTitle = "Gestion des Entreprises";
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden max-w-full">
          <header className="sticky top-0 z-30 bg-background border-b h-16 flex items-center px-4 w-full">
            <div className="flex justify-between items-center w-full">
              <h1 className="text-xl font-semibold truncate">{pageTitle}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="hidden md:block">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.role === 'manager' ? 'gestionnaire de flottes' : user.role}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={logout}>
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden p-4 md:p-6 w-full max-w-full">
            <div className="w-full max-w-full overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
