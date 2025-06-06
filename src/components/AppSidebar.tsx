
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
import { Home, User, Car, Calendar, Globe, Building } from "lucide-react";

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-6">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-lg font-bold text-white">Hermes</h1>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className={location.pathname === "/" ? "text-sidebar-primary bg-sidebar-accent/50" : "text-white"}>
                <Home className="h-5 w-5" />
                <span>Tableau de bord</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/chauffeurs" className={location.pathname === "/chauffeurs" ? "text-sidebar-primary bg-sidebar-accent/50" : "text-white"}>
                <User className="h-5 w-5" />
                <span>Chauffeurs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/vehicules" className={location.pathname === "/vehicules" ? "text-sidebar-primary bg-sidebar-accent/50" : "text-white"}>
                <Car className="h-5 w-5" />
                <span>Véhicules</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/entreprises" className={location.pathname === "/entreprises" ? "text-sidebar-primary bg-sidebar-accent/50" : "text-white"}>
                <Building className="h-5 w-5" />
                <span>Entreprises</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/missions" className={location.pathname === "/missions" ? "text-sidebar-primary bg-sidebar-accent/50" : "text-white"}>
                <Calendar className="h-5 w-5" />
                <span>Missions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/site-web" className={location.pathname === "/site-web" ? "text-sidebar-primary bg-sidebar-accent/50" : "text-white"}>
                <Globe className="h-5 w-5" />
                <span>Site Web</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-4 py-4">
        <div className="text-xs text-white/60">
          {/* Footer content removed */}
        </div>
      </SidebarFooter>
      {/* Repositioned sidebar trigger button to bottom left */}
      <SidebarTrigger className="fixed bottom-4 left-4 z-50 h-10 w-10 bg-black dark:bg-black shadow-md rounded-full flex items-center justify-center" />
    </Sidebar>
  );
}
