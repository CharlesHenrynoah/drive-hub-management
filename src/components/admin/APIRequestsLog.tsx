
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Loader2, Database, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function APIRequestsLog() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger l'historique des requêtes API
  useEffect(() => {
    loadAPIRequests();

    // Mettre en place un abonnement en temps réel pour les nouvelles requêtes
    const channel = supabase
      .channel('api_requests_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'api_requests',
        },
        (payload) => {
          setRequests((current) => [payload.new, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAPIRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("api_requests")
        .select("*, api_keys(name)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des requêtes API: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir la couleur d'affichage basée sur le statut HTTP
  const getStatusColor = (status: number) => {
    if (status >= 500) return "text-red-500";
    if (status >= 400) return "text-amber-500";
    if (status >= 300) return "text-blue-500";
    if (status >= 200) return "text-green-500";
    return "text-gray-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Journal des requêtes API
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune requête API enregistrée
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Clé API</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Temps de réponse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>{request.api_keys?.name || "Inconnue"}</TableCell>
                    <TableCell>
                      <span className={
                        request.method === "POST" ? "text-green-600 font-medium" :
                        request.method === "GET" ? "text-blue-600 font-medium" :
                        request.method === "PUT" ? "text-amber-600 font-medium" :
                        request.method === "DELETE" ? "text-red-600 font-medium" :
                        "font-medium"
                      }>
                        {request.method}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{request.endpoint}</TableCell>
                    <TableCell>{request.ip_address}</TableCell>
                    <TableCell>
                      <span className={getStatusColor(request.status_code)}>
                        {request.status_code}
                      </span>
                    </TableCell>
                    <TableCell>{request.response_time_ms} ms</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
