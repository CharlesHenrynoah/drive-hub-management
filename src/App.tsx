
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VehiclesPage from "./pages/VehiclesPage";
import DriversPage from "./pages/DriversPage";
import FleetsPage from "./pages/FleetsPage";
import MissionsPage from "./pages/MissionsPage";
import MissionsAPI from "./pages/MissionsAPI";

// Import des pages d'administration spécifiques
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminDatabasePage from "./pages/admin/AdminDatabasePage";
import AdminCommunicationPage from "./pages/admin/AdminCommunicationPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/vehicules" element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>} />
            <Route path="/chauffeurs" element={<ProtectedRoute><DriversPage /></ProtectedRoute>} />
            <Route path="/flottes" element={<ProtectedRoute><FleetsPage /></ProtectedRoute>} />
            <Route path="/missions" element={<ProtectedRoute><MissionsPage /></ProtectedRoute>} />
            <Route path="/api-missions" element={<ProtectedRoute><MissionsAPI /></ProtectedRoute>} />
            
            {/* Routes d'administration avec des pages spécifiques */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/utilisateurs" element={<ProtectedRoute requiredRole="admin"><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/parametres" element={<ProtectedRoute requiredRole="admin"><AdminSettingsPage /></ProtectedRoute>} />
            <Route path="/admin/donnees" element={<ProtectedRoute requiredRole="admin"><AdminDatabasePage /></ProtectedRoute>} />
            <Route path="/admin/communication" element={<ProtectedRoute requiredRole="admin"><AdminCommunicationPage /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
