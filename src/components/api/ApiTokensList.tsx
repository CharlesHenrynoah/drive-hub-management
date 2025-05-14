
import { useState, useEffect } from "react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked: boolean;
}

export function ApiTokensList() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null);
  
  const fetchApiKeys = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setApiKeys(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des tokens API:", error);
      toast.error("Impossible de charger les tokens API");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchApiKeys();
  }, []);
  
  const revokeToken = async () => {
    if (!tokenToRevoke) return;
    
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ revoked: true })
        .eq('id', tokenToRevoke);
        
      if (error) {
        throw error;
      }
      
      toast.success("Token API révoqué avec succès");
      fetchApiKeys();
    } catch (error) {
      console.error("Erreur lors de la révocation du token:", error);
      toast.error("Impossible de révoquer le token API");
    } finally {
      setTokenToRevoke(null);
    }
  };
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Jamais";
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tokens API existants</h3>
        <Button variant="outline" size="sm" onClick={fetchApiKeys} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>
      
      {apiKeys.length === 0 ? (
        <div className="text-center p-4 text-muted-foreground">
          {loading ? "Chargement des tokens..." : "Aucun token API n'a été généré"}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead>Dernière utilisation</TableHead>
                <TableHead>État</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>{key.name}</TableCell>
                  <TableCell>{formatDate(key.created_at)}</TableCell>
                  <TableCell>{formatDate(key.last_used_at)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${key.revoked 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'}`}
                    >
                      {key.revoked ? "Révoqué" : "Actif"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={key.revoked}
                      onClick={() => setTokenToRevoke(key.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <AlertDialog open={!!tokenToRevoke} onOpenChange={() => setTokenToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Révoquer ce token API?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Une fois révoqué, le token ne pourra plus 
              être utilisé pour accéder à l'API.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={revokeToken} className="bg-red-500 hover:bg-red-600">
              Révoquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
