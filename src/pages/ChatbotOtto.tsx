import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

// Composant d'effet de frappe pour les réponses de l'IA
interface TypewriterEffectProps {
  text: string;
  speed?: number;
}

const TypewriterEffect = ({ text, speed = 30 }: TypewriterEffectProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return <span>{displayedText}</span>;
};

const ChatbotOtto = () => {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  
  // Use the initial message from the landing page if provided
  useEffect(() => {
    if (location.state?.initialMessage) {
      setInputValue(location.state.initialMessage);
      // If we have an initial message, submit it automatically
      handleSubmitWithAPI(location.state.initialMessage);
    }
  }, [location.state]);

  const fetchGeminiResponse = async (userMessage: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB_lBRH0ja-p9-8Xzvzv8RfTU6z5QHKRWs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ 
              text: `Tu es Otto, un assistant virtuel spécialisé dans les locations d'autocars pour autocar-location.com. 
              Voici les informations exactes sur notre entreprise que tu dois utiliser pour répondre aux questions:

              COORDONNÉES
              • Téléphone : +33 (0)9 80 40 04 84 (ligne joignable du lundi au vendredi de 09h à 18h).
              • Adresse : NEOTRAVEL SAS, 60 Ter rue de Bellevue, 92100 Boulogne-Billancourt.
              • Les demandes et réservations se font directement sur notre plateforme en ligne.
              
              SERVICES PROPOSÉS
              • Types de véhicules : minibus (jusqu'à 19 pers.), minicar (20–38 pers.), autocar/bus (38–65 pers.) et autocar « grand tourisme » double étage (66–93 pers.).
              • Équipements & options : Véhicules « tout confort » (sièges inclinables, accoudoirs, repose-pieds, climatisation, prises, micros) et souvent équipés de Wi-Fi. Des services complémentaires sont aussi offerts (VTC, berlines ou vans avec chauffeur) en fonction du besoin.
              • Destinations couvertes : Ensemble de la France et international. Trajets possibles « au départ de Paris, Bordeaux, Toulouse, Montpellier ou toute autre ville de France et d'Europe » (ex. Barcelone).
              
              TARIFS ET RÉSERVATIONS
              • Les tarifs sont calculés automatiquement et affichés lors de la réservation directement sur notre plateforme. Les prix varient selon la distance, le type de véhicule et les services demandés.
              
              CONDITIONS D'ANNULATION
              • Annulation ≥21 jours avant le départ : 30 % du prix.
              • Annulation entre 20 et 14 jours : 50 %.
              • Annulation entre 13 et 7 jours : 70 %.
              • Annulation entre 6 et 2 jours : 90 %.
              • Annulation la veille ou le jour du départ : 100 % du prix.
              
              ASSURANCES
              • Autocar-Location (NEOTRAVEL SAS) dispose des assurances obligatoires pour le transport de voyageurs.
              • Responsabilité civile professionnelle « autocar » jusqu'à 10 000 000 € par sinistre chez Allianz.
              • Assurance pour activité d'agence de voyages (Compagnie Hiscox).
              • Garantie financière (200 000 € avec Groupama) en cas de défaillance.
              
              DÉPÔT DE GARANTIE (CAUTION)
              • Caution (chèque) possible au moment de la réservation, selon le type de service.
              • Encaissée uniquement si dégradations constatées.
              • Restituée sous 5 jours ouvrés après la prestation en l'absence de problème.
              • En cas de dégâts : remboursement de la différence entre coût des réparations et montant de la caution (délai d'un mois).
              • Forfait d'immobilisation de 500 € par jour possible en sus des frais de remise en état.
              
              HORAIRES DU SERVICE CLIENT
              • Du lundi au vendredi, de 09h00 à 18h00.
              
              AVIS CLIENTS
              • Note moyenne de 4,94/5 sur 34 avis (via Trusted Shops).
              • Clients louent souvent la réactivité et la qualité du service.
              
              Processus de réflexion:
              1. Analyse attentivement la nouvelle question de l'utilisateur.
              2. Vérifie si tu as déjà répondu à cette question ou à une question similaire dans l'historique.
              3. Consulte l'historique de la conversation pour comprendre le contexte et les informations déjà partagées.
              4. Identifie les informations pertinentes dans ta base de connaissances.
              5. Formule une réponse précise et adaptée au contexte de la conversation.
              
              Règles importantes:
              - NE JAMAIS commencer ta réponse par "Bonjour" ou une salutation si ce n'est pas le premier message de la conversation.
              - NE PAS répéter des informations déjà mentionnées dans la conversation, sauf si l'utilisateur te le demande explicitement.
              - Maintenir la continuité de la conversation comme si tu parlais avec la même personne.
              - Faire référence aux messages précédents lorsque c'est pertinent (ex: "Comme je l'ai mentionné...", "Pour compléter ma réponse précédente...").
              - Être très concis et direct dans tes réponses.
              
              Réponds en français à cette demande concernant la location d'autocar, en utilisant uniquement les informations fournies dans ta base de connaissances.
              Sois précis, courtois et concis. Si tu n'as pas l'information demandée dans les données ci-dessus, invite l'utilisateur à contacter le service client par téléphone.
              
              NOUVELLE QUESTION DE L'UTILISATEUR: ${userMessage}
              ` 
            }]
          }]
        }),
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Format de réponse inattendu");
      }
    } catch (error) {
      console.error("Erreur lors de la communication avec l'API Gemini:", error);
      return "Désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler votre question?";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitWithAPI = async (message: string = inputValue) => {
    if (!message.trim()) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { text: message, isUser: true }]);
    setShowChat(true);
    setInputValue("");
    
    try {
      // Get AI response
      const aiResponse = await fetchGeminiResponse(message);
      
      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        { text: aiResponse, isUser: false }
      ]);
    } catch (error) {
      toast.error("Erreur lors de la communication avec Otto");
      console.error(error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitWithAPI();
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-black">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: "url('/pages/background/backgroundchat.png')", 
          filter: "blur(5px)",
          backgroundSize: "cover",
          margin: "-10px",
          width: "calc(100% + 20px)",
          height: "calc(100% + 20px)"
        }}
      ></div>
      {/* Header */}
      <header className="bg-black text-white py-4 px-4 flex items-center sticky top-0 z-20 relative">
        <Link to="/site-web" className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
            <img src="/pages/background/robotpng.png" alt="Otto" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="font-semibold">Otto</h1>
            <p className="text-xs text-gray-300">Assistant IA Autocar-Location</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        className="flex-1 overflow-y-auto p-2 space-y-6 relative z-10" 
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)"
        }}
      >
        <style>
          {`
            ::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        <div className="max-w-[90%] mx-auto pb-16">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"} mb-4`}
            >
              <div
                className={`max-w-[65%] rounded-2xl p-4 ${
                  message.isUser
                    ? "bg-hermes-green text-black"
                    : "bg-gray-800/70 text-white border border-gray-700"
                }`}
              >
                {!message.isUser && index === messages.length - 1 ? (
                  <TypewriterEffect text={message.text} speed={20} />
                ) : (
                  message.text
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-800/70 text-white border border-gray-700 max-w-[65%] rounded-2xl p-4">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-2 py-3 fixed bottom-0 left-0 right-0 z-20">
        <form onSubmit={handleSubmit} className="max-w-[80%] mx-auto">
          <div className="flex items-center bg-white rounded-xl shadow-md p-1">
            <Input
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-4 py-3 text-black placeholder:text-gray-500"
              placeholder="Posez une question à Otto..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              style={{ backgroundColor: 'transparent' }}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-lg bg-hermes-green hover:bg-hermes-green/80 text-black ml-1 mr-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="text-center text-xs text-gray-400 mt-2">
            Assistant IA Autocar-Location optimisé pour le dialogue. Informations mises à jour 2025.
          </div>
        </form>
      </div>
      {/* Test button removed as it was not relevant */}
    </div>
  );
};

export default ChatbotOtto;
