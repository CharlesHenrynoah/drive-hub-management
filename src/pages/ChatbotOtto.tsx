
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "react-router-dom";

const ChatbotOtto = () => {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    {
      text: "Bienvenue dans votre assistant de recherche Otto. Je vais vous aider à trouver la meilleure option pour votre déplacement en autocar.",
      isUser: false,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [showChat, setShowChat] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Ajouter le message de l'utilisateur
    setMessages((prev) => [...prev, { text: inputValue, isUser: true }]);
    setShowChat(true);
    
    // Simuler une réponse du chatbot après un court délai
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: "Merci pour votre demande. Je recherche les meilleures options pour votre trajet. Pouvez-vous me donner plus de détails sur votre déplacement comme la date et le nombre de personnes ?",
          isUser: false,
        },
      ]);
    }, 1000);

    setInputValue("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-[#1A1F2C] text-white py-4 px-4 flex items-center sticky top-0 z-10">
        <Link to="/site-web" className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-hermes-green flex items-center justify-center text-black font-bold mr-3">
            O
          </div>
          <div>
            <h1 className="font-semibold">Otto</h1>
            <p className="text-xs text-gray-300">Assistant IA Autocar-Location</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-3/4 rounded-lg p-4 ${
                message.isUser
                  ? "bg-hermes-green text-black"
                  : "bg-white shadow-sm text-gray-800"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white sticky bottom-0">
        {!showChat ? (
          <div className="max-w-3xl mx-auto bg-white rounded-lg p-4 shadow-sm">
            <Input
              className="w-full p-4 mb-4"
              placeholder="Exemple: Je souhaite effectuer un déplacement de Paris à Lyon le 10 juillet 2025, nous sommes un groupe de 25 personnes..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button 
              type="submit" 
              className="w-full md:w-auto bg-hermes-green text-black hover:bg-hermes-green/80"
            >
              Chercher
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Input
              className="flex-1"
              placeholder="Posez une question à Otto..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button type="submit" size="icon" className="bg-hermes-green hover:bg-hermes-green/80">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </form>

      {/* Test Button (as shown in your reference image) */}
      <div className="fixed bottom-6 right-6">
        <Button className="bg-[#1A1F2C] rounded-md px-4 py-2 text-white">
          test
        </Button>
      </div>
    </div>
  );
};

export default ChatbotOtto;
