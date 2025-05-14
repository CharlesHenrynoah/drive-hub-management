
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const ChatbotOtto = () => {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    {
      text: "Bienvenue dans votre assistant de recherche Otto. Je vais vous aider à trouver la meilleure option pour votre déplacement en autocar.",
      isUser: false,
    },
  ]);
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
              Réponds en français à cette demande concernant la location d'autocar: ${userMessage}` 
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
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-sm text-gray-800 max-w-3/4 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
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
              disabled={isLoading}
            >
              {isLoading ? "Chargement..." : "Chercher"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Input
              className="flex-1"
              placeholder="Posez une question à Otto..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="bg-hermes-green hover:bg-hermes-green/80"
              disabled={isLoading}
            >
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
