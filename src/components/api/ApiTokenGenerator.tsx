
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Copy, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ApiTokenGenerator() {
  const [tokenName, setTokenName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");
  
  const generateToken = async () => {
    if (!tokenName.trim()) {
      toast.error("Veuillez donner un nom à votre token");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Générer un identifiant unique
      const apiKey = crypto.randomUUID().replace(/-/g, '') + 
                     crypto.randomUUID().replace(/-/g, '');
      
      // Enregistrer dans la base de données
      const { error } = await supabase.from('api_keys').insert({
        name: tokenName,
        api_key: apiKey,
        revoked: false
      });
      
      if (error) {
        throw error;
      }
      
      setGeneratedToken(apiKey);
      toast.success("Token API généré avec succès");
    } catch (error) {
      console.error("Erreur lors de la génération du token:", error);
      toast.error("Impossible de générer le token API");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papiers");
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Générer un nouveau token API</CardTitle>
          <CardDescription>
            Les tokens API permettent d'accéder à vos données via des requêtes externes sécurisées.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenName">Nom du token</Label>
            <Input 
              id="tokenName" 
              placeholder="ex: Application mobile" 
              value={tokenName} 
              onChange={(e) => setTokenName(e.target.value)} 
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={generateToken} 
            disabled={isGenerating || !tokenName.trim()}
          >
            {isGenerating ? "Génération..." : "Générer un token API"}
          </Button>
        </CardFooter>
      </Card>
      
      {generatedToken && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div className="font-bold">ATTENTION: Copiez ce token maintenant!</div>
            <div className="text-sm">
              Pour des raisons de sécurité, ce token ne sera plus affiché après avoir quitté cette page.
            </div>
            <div className="flex items-center gap-2 bg-slate-800 p-2 rounded mt-2">
              <code className="text-xs break-all flex-1">
                {generatedToken}
              </code>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => copyToClipboard(generatedToken)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
