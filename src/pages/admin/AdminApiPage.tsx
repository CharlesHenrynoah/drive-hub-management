
import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ApiTokenGenerator } from "@/components/api/ApiTokenGenerator";
import { ApiTokensList } from "@/components/api/ApiTokensList";
import { ApiDocumentation } from "@/components/api/ApiDocumentation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { KeyRound, ListChecks, FileText } from "lucide-react";

export default function AdminApiPage() {
  const [activeTab, setActiveTab] = useState("tokens");
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Gestion de l'API</h2>
          <p className="text-zinc-400">
            Générez des tokens API et consultez la documentation pour intégrer vos applications externes.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              <span className="hidden sm:inline">Tokens</span>
            </TabsTrigger>
            <TabsTrigger value="existing" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              <span className="hidden sm:inline">Liste</span>
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documentation</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="tokens">
              <ApiTokenGenerator />
            </TabsContent>
            
            <TabsContent value="existing">
              <ApiTokensList />
            </TabsContent>
            
            <TabsContent value="documentation">
              <ApiDocumentation />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
