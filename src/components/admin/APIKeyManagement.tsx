
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Loader2, Copy, Eye, EyeOff, Shield, Key, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function APIKeyManagement() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyName, setKeyName] = useState("");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [generatingKey, setGeneratingKey] = useState(false);

  // Charger les clés API existantes
  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des clés API: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateAPIKey = async () => {
    if (!keyName.trim()) {
      toast.error("Veuillez entrer un nom pour la clé API");
      return;
    }

    try {
      setGeneratingKey(true);
      
      // Appeler la fonction Edge pour générer une nouvelle clé API
      const { data, error } = await supabase.functions.invoke("generate-api-key", {
        body: { name: keyName.trim() }
      });

      if (error) throw error;
      
      if (data && data.key) {
        toast.success("Clé API générée avec succès");
        setKeyName("");
        await loadAPIKeys();
        
        // Montrer automatiquement la clé nouvellement créée
        setShowKeys(prev => ({ ...prev, [data.id]: true }));
      }
    } catch (error: any) {
      toast.error("Erreur lors de la génération de la clé API: " + error.message);
    } finally {
      setGeneratingKey(false);
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.info("Clé API copiée dans le presse-papier");
  };

  const revokeKey = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir révoquer cette clé API ? Cette action est irréversible.")) {
      return;
    }
    
    try {
      const { error } = await supabase.functions.invoke("revoke-api-key", {
        body: { key_id: id }
      });
      
      if (error) throw error;
      
      toast.success("Clé API révoquée avec succès");
      await loadAPIKeys();
    } catch (error: any) {
      toast.error("Erreur lors de la révocation de la clé API: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Générer une nouvelle clé API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input 
              value={keyName} 
              onChange={(e) => setKeyName(e.target.value)} 
              placeholder="Nom de la clé API (ex: Application mobile)" 
              className="flex-1"
            />
            <Button 
              onClick={generateAPIKey} 
              disabled={generatingKey || !keyName.trim()}
              className="whitespace-nowrap"
            >
              {generatingKey ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                "Générer une clé"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Clés API existantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune clé API n'a été générée
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Clé</TableHead>
                    <TableHead>Créée le</TableHead>
                    <TableHead>Dernière utilisation</TableHead>
                    <TableHead>État</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>{key.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">
                            {showKeys[key.id] ? key.api_key : "••••••••••••••••••••••••••"}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleKeyVisibility(key.id)}
                          >
                            {showKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => copyToClipboard(key.api_key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(key.created_at).toLocaleDateString('fr-FR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </TableCell>
                      <TableCell>
                        {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString('fr-FR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : "Jamais utilisée"}
                      </TableCell>
                      <TableCell>
                        {key.revoked ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            Révoquée
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => revokeKey(key.id)}
                          disabled={key.revoked}
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
        </CardContent>
      </Card>
    </div>
  );
}
