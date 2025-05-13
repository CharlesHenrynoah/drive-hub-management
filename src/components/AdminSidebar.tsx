
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Shield, Users, Settings, Database, Mail, ChartBar } from "lucide-react";

export function AdminSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-6">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-hermes-green" />
          <div>
            <h1 className="text-lg font-bold text-white">Hermes Admin</h1>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin" className={location.pathname === "/admin" ? "text-sidebar-primary bg-sidebar-accent/50" : "text-white"}>
                <ChartBar className="h-5 w-5" />
                <span>Tableau de bord</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin/utilisateurs" className={location.pathname === "/admin/utilisateurs" ? "text-sidebar-primary bg-sidebar-accent/50" : "text-white"}>
                <Users className="h-5 w-5" />
                <span>Utilisateurs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin/parametres" className={location.pathname === "/admin/parametres" ? "text-sidebar-primary bg-sidebar-accent/50" : "text-white"}>
                <Settings className="h-5 w-5" />
                <span>Paramètres</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin/donnees" className={location.pathname === "/admin/donnees" ? "text-sidebar-primary bg-sidebar-accent/50" : "text-white"}>
                <Database className="h-5 w-5" />
                <span>Base de données</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin/communication" className={location.pathname === "/admin/communication" ? "text-sidebar-primary bg-sidebar-accent/50" : "text-white"}>
                <Mail className="h-5 w-5" />
                <span>Communication</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-4 py-4">
        <div className="text-xs text-white/60">
          Panneau d'administration Hermes
        </div>
      </SidebarFooter>
      <SidebarTrigger className="fixed bottom-4 left-4 z-50 h-10 w-10 bg-black dark:bg-black shadow-md rounded-full flex items-center justify-center" />
    </Sidebar>
  );
}
