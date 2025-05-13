
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { APIKeyManagement } from "@/components/admin/APIKeyManagement";
import { APIRequestsLog } from "@/components/admin/APIRequestsLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Key, FileText } from "lucide-react";
import { Navigate } from "react-router-dom";

function AdminContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("keys");
  
  // Vérifie si l'utilisateur a le rôle administrateur
  // Dans cet exemple simple, on considère que l'utilisateur "admin" est administrateur
  // Dans une application réelle, on vérifierait le rôle dans la base de données
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Administration</h1>
        </div>

        <Tabs
          defaultValue="keys"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Clés API
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Journal des requêtes
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="keys" className="m-0">
              <APIKeyManagement />
            </TabsContent>
            
            <TabsContent value="logs" className="m-0">
              <APIRequestsLog />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <AdminContent />
      </DashboardLayout>
    </AuthProvider>
  );
}
