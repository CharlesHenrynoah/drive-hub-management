
import React from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { MissionAPIDoc } from "@/docs/MissionAPIDoc";
import { AuthProvider } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function MissionsAPI() {
  return (
    <AuthProvider>
      <DashboardLayout>
        <div className="w-full max-w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold truncate">API de missions</h1>
          </div>
          
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Cette API permet de créer des missions via des requêtes HTTPS externes. 
              Assurez-vous de sécuriser votre clé API et de ne la partager qu'avec des services autorisés.
            </AlertDescription>
          </Alert>
          
          <MissionAPIDoc />
        </div>
      </DashboardLayout>
    </AuthProvider>
  );
}
