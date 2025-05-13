
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("jean.dupont@exemple.fr");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("manager"); // manager ou admin
  const { login } = useAuth();
  const { toast } = useToast();

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Log in an existing user with the selected role
      await login(email, password, role);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Hermes",
      });
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      toast({
        title: "Erreur de connexion",
        description: error?.message === "Invalid login credentials" 
          ? "Email ou mot de passe incorrect" 
          : error?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/lovable-uploads/1cf44c13-37d1-4004-b60c-77fea1fc455b.png')" }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <Card className="w-full max-w-md relative z-10 bg-black/80 border-hermes-green/50">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 bg-hermes-green rounded-full flex items-center justify-center">
              <Car className="h-6 w-6 text-black" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Hermes</CardTitle>
          <CardDescription className="text-gray-300">
            Connectez-vous à votre compte
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="manager" onValueChange={value => setRole(value)} className="w-full">
          <TabsList className="grid grid-cols-2 w-[90%] mx-auto mb-4">
            <TabsTrigger value="manager" className="data-[state=active]:bg-hermes-green data-[state=active]:text-black">
              <Car className="mr-2 h-4 w-4" />
              Gestionnaire de flottes
            </TabsTrigger>
            <TabsTrigger value="admin" className="data-[state=active]:bg-hermes-green data-[state=active]:text-black">
              <Shield className="mr-2 h-4 w-4" />
              Administrateur
            </TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-hermes-green/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/10 border-hermes-green/20 text-white"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-hermes-green text-black hover:bg-hermes-green/90" disabled={isLoading}>
                {isLoading ? "Chargement..." : "Se connecter"}
              </Button>
            </CardFooter>
          </form>
        </Tabs>
      </Card>
    </div>
  );
}
