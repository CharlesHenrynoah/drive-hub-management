
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
import { Home, Car, User, Users, Map, Building2, Calendar } from "lucide-react";

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-6">
        <div className="flex items-center gap-2">
          <Car className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">DriveHub</h1>
            <p className="text-xs text-sidebar-foreground/60">Gestion de flotte</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className={location.pathname === "/" ? "text-sidebar-primary bg-sidebar-accent/50" : ""}>
                <Home className="h-5 w-5" />
                <span>Tableau de bord</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/vehicules" className={location.pathname === "/vehicules" ? "text-sidebar-primary bg-sidebar-accent/50" : ""}>
                <Car className="h-5 w-5" />
                <span>Véhicules</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/chauffeurs" className={location.pathname === "/chauffeurs" ? "text-sidebar-primary bg-sidebar-accent/50" : ""}>
                <User className="h-5 w-5" />
                <span>Chauffeurs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/flottes" className={location.pathname === "/flottes" ? "text-sidebar-primary bg-sidebar-accent/50" : ""}>
                <Users className="h-5 w-5" />
                <span>Flottes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/entreprises" className={location.pathname === "/entreprises" ? "text-sidebar-primary bg-sidebar-accent/50" : ""}>
                <Building2 className="h-5 w-5" />
                <span>Entreprises</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/missions" className={location.pathname === "/missions" ? "text-sidebar-primary bg-sidebar-accent/50" : ""}>
                <Calendar className="h-5 w-5" />
                <span>Missions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-4 py-4">
        <div className="text-xs text-sidebar-foreground/60">
          <p className="font-medium">DriveHub Management</p>
          <p>Version 1.0.0</p>
        </div>
      </SidebarFooter>
      <SidebarTrigger className="absolute top-4 right-0 translate-x-1/2 h-8 w-8" />
    </Sidebar>
  );
}
