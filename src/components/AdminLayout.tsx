
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, Bell } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== "admin") {
    navigate("/login");
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden bg-zinc-950">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden max-w-full">
          <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 h-16 flex items-center px-4 w-full">
            <div className="flex justify-between items-center w-full">
              <h1 className="text-xl font-semibold text-white truncate">Administration</h1>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                  <Bell className="h-5 w-5" />
                </Button>
                <div className="flex items-center space-x-2">
                  {user && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full bg-hermes-green flex items-center justify-center text-black">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="hidden md:block">
                          <p className="text-sm font-medium text-white truncate">{user.name}</p>
                          <p className="text-xs text-zinc-400 truncate">Administrateur</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={logout}>
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden p-4 md:p-6 w-full max-w-full bg-zinc-900">
            <div className="w-full max-w-full overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
