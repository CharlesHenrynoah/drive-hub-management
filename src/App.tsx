
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HelmetProvider } from "react-helmet-async";
import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DriversPage from "./pages/DriversPage";
import FleetsPage from "./pages/FleetsPage";
import MissionsPage from "./pages/MissionsPage";
import MissionsAPI from "./pages/MissionsAPI";
import LandingPage from "./pages/LandingPage";
import ChatbotOtto from "./pages/ChatbotOtto";
import CompaniesPage from "./pages/CompaniesPage";
import VehiclesPage from "./pages/VehiclesPage";

// Import des pages d'administration spécifiques
import AdminApiPage from "./pages/admin/AdminApiPage";

// Create a query client instance outside of the component
const queryClient = new QueryClient();

// Convert App from a constant arrow function to a proper function component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <HelmetProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/chauffeurs" element={<ProtectedRoute><DriversPage /></ProtectedRoute>} />
                <Route path="/flottes" element={<ProtectedRoute><FleetsPage /></ProtectedRoute>} />
                <Route path="/entreprises" element={<ProtectedRoute><CompaniesPage /></ProtectedRoute>} />
                <Route path="/missions" element={<ProtectedRoute><MissionsPage /></ProtectedRoute>} />
                <Route path="/api-missions" element={<ProtectedRoute><MissionsAPI /></ProtectedRoute>} />
                <Route path="/site-web" element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />
                <Route path="/chatbotOtto" element={<ProtectedRoute><ChatbotOtto /></ProtectedRoute>} />
                <Route path="/vehicules" element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>} />
                
                {/* Nouvelle route d'administration */}
                <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminApiPage /></ProtectedRoute>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </HelmetProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
