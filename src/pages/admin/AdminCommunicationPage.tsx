
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Send, MessageSquare, Users, History } from "lucide-react";

export default function AdminCommunicationPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Communication</h2>
          <p className="text-zinc-400">
            Gérez les communications avec les utilisateurs
          </p>
        </div>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-hermes-green" />
              <CardTitle className="text-white">Communications</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">
              Envoyez des messages et notifications aux utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="space-y-4">
              <TabsList className="bg-zinc-700">
                <TabsTrigger value="email" className="data-[state=active]:bg-hermes-green data-[state=active]:text-black">
                  Email
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-hermes-green data-[state=active]:text-black">
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-hermes-green data-[state=active]:text-black">
                  Historique
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="recipients" className="text-white">Destinataires</Label>
                    <div className="flex space-x-2">
                      <Input id="recipients" placeholder="Sélectionner des destinataires" className="bg-zinc-700 border-zinc-600 text-white" />
                      <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">
                        <Users className="h-4 w-4 mr-2" />
                        Tous
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="subject" className="text-white">Sujet</Label>
                    <Input id="subject" placeholder="Sujet de l'email" className="bg-zinc-700 border-zinc-600 text-white" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="message" className="text-white">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Rédigez votre message ici..." 
                      className="min-h-[200px] bg-zinc-700 border-zinc-600 text-white"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">
                    Prévisualiser
                  </Button>
                  <Button className="bg-hermes-green hover:bg-hermes-green/80 text-black">
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="notif-recipients" className="text-white">Destinataires</Label>
                    <div className="flex space-x-2">
                      <Input id="notif-recipients" placeholder="Sélectionner des destinataires" className="bg-zinc-700 border-zinc-600 text-white" />
                      <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">
                        <Users className="h-4 w-4 mr-2" />
                        Tous
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="notif-title" className="text-white">Titre</Label>
                    <Input id="notif-title" placeholder="Titre de la notification" className="bg-zinc-700 border-zinc-600 text-white" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="notif-content" className="text-white">Contenu</Label>
                    <Textarea 
                      id="notif-content" 
                      placeholder="Contenu de la notification..." 
                      className="min-h-[100px] bg-zinc-700 border-zinc-600 text-white"
                    />
                  </div>
                </div>
                
                <Button className="bg-hermes-green hover:bg-hermes-green/80 text-black">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Envoyer la notification
                </Button>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <div className="rounded-md border border-zinc-700 overflow-hidden">
                  <div className="px-4 py-3 bg-zinc-900 flex items-center space-x-2">
                    <History className="h-4 w-4 text-hermes-green" />
                    <h3 className="font-medium text-white">Historique des communications</h3>
                  </div>
                  <div className="p-0">
                    <Table>
                      <TableHeader className="bg-zinc-900">
                        <TableRow>
                          <TableHead className="text-zinc-400">Date</TableHead>
                          <TableHead className="text-zinc-400">Type</TableHead>
                          <TableHead className="text-zinc-400">Sujet</TableHead>
                          <TableHead className="text-zinc-400">Destinataires</TableHead>
                          <TableHead className="text-zinc-400 text-right">Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-zinc-700">
                          <TableCell>15/10/2023 14:30</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-500">
                              <Mail className="h-3 w-3 mr-1" /> Email
                            </span>
                          </TableCell>
                          <TableCell>Maintenance planifiée</TableCell>
                          <TableCell>Tous les utilisateurs</TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-500/20 text-green-500">
                              Envoyé
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-zinc-700">
                          <TableCell>14/10/2023 09:15</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-500">
                              <MessageSquare className="h-3 w-3 mr-1" /> Notification
                            </span>
                          </TableCell>
                          <TableCell>Nouvelle fonctionnalité</TableCell>
                          <TableCell>Administrateurs</TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-500/20 text-green-500">
                              Envoyé
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-zinc-700">
                          <TableCell>10/10/2023 16:45</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-500">
                              <Mail className="h-3 w-3 mr-1" /> Email
                            </span>
                          </TableCell>
                          <TableCell>Mise à jour de sécurité</TableCell>
                          <TableCell>Tous les utilisateurs</TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-500/20 text-green-500">
                              Envoyé
                            </span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
