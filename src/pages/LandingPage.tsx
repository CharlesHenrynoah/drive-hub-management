
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Leaf, Clock, Medal, Scale, CheckCircle, MessageSquare } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="bg-black text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-hermes-green font-bold text-xl">autocar</span>
              <span className="text-white">-location.com</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="hover:text-hermes-green">ACCUEIL</a>
              <a href="#" className="hover:text-hermes-green">QUI SOMMES-NOUS ?</a>
              <a href="#" className="hover:text-hermes-green">SERVICES</a>
              <a href="#" className="hover:text-hermes-green">RÉGLEMENTATION</a>
              <a href="#" className="hover:text-hermes-green">AVIS CLIENTS</a>
              <a href="#" className="hover:text-hermes-green">CAREERS</a>
              <a href="#" className="hover:text-hermes-green">BLOG</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center bg-gray-300 bg-[url('/placeholder.svg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Location autocar, bus, minibus avec chauffeur
          </h1>
          <div className="max-w-3xl mx-auto bg-white rounded-lg p-4">
            <Input 
              className="w-full p-4 mb-4" 
              placeholder="Exemple: Je souhaite effectuer un déplacement de Paris à Lyon le 10 juillet 2025, nous sommes un groupe de 25 personnes..." 
            />
            <Button className="w-full md:w-auto bg-hermes-green text-black hover:bg-hermes-green/80">
              Chercher
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-white shadow-md flex items-center justify-center mb-4">
              <Leaf className="h-12 w-12 text-hermes-green" />
            </div>
            <h3 className="font-semibold">Découvrez nos engagements</h3>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-white shadow-md flex items-center justify-center mb-4">
              <Clock className="h-12 w-12" />
            </div>
            <h3 className="font-semibold">Devis simple & rapide</h3>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-white shadow-md flex items-center justify-center mb-4">
              <Medal className="h-12 w-12 text-yellow-500" />
            </div>
            <h3 className="font-semibold">Garanties exclusives</h3>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-white shadow-md flex items-center justify-center mb-4">
              <Scale className="h-12 w-12" />
            </div>
            <h3 className="font-semibold">Rapport qualité / prix</h3>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-white shadow-md flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-teal-500" />
            </div>
            <h3 className="font-semibold">Avis certifiés</h3>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Pourquoi choisir Autocar-Location.com ?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">Service sur mesure</h3>
              <p className="text-gray-700">
                Notre équipe d'experts vous accompagne dans l'organisation de votre transport en autocar, bus ou
                minibus avec chauffeur pour tous vos déplacements en groupe.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">Flotte moderne</h3>
              <p className="text-gray-700">
                Nous disposons d'une large gamme de véhicules récents et confortables, adaptés à tous types de
                voyages et à toutes tailles de groupes.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">Chauffeurs professionnels</h3>
              <p className="text-gray-700">
                Nos chauffeurs expérimentés et professionnels garantissent votre sécurité et votre confort tout au
                long de votre trajet.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">Tarifs compétitifs</h3>
              <p className="text-gray-700">
                Nous vous proposons les meilleurs tarifs du marché pour la location d'autocar avec chauffeur, sans
                compromis sur la qualité de service.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">Disponibilité 7j/7</h3>
              <p className="text-gray-700">
                Notre service client est à votre écoute 7 jours sur 7 pour répondre à toutes vos questions et vous
                accompagner dans vos projets.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">Couverture nationale</h3>
              <p className="text-gray-700">
                Nous intervenons sur l'ensemble du territoire français et proposons également des services pour vos
                déplacements à l'international.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Chat Assistant */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">Posez vos questions à Otto</h2>
          <p className="text-center text-gray-700 mb-12 max-w-3xl mx-auto">
            Otto, notre assistant virtuel, est disponible 24h/24 pour répondre à toutes vos questions
            concernant la location d'autocar. Voici quelques exemples de questions que vous pouvez lui
            poser :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-full bg-hermes-green flex items-center justify-center mr-2">
                    <span className="text-black font-bold">O</span>
                  </div>
                  <h3 className="font-semibold">Tarifs et devis</h3>
                </div>
                <p className="text-gray-700 italic">
                  "Quel est le prix pour un autocar de 50 personnes pour un trajet Paris-Bordeaux ?"
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-full bg-hermes-green flex items-center justify-center mr-2">
                    <span className="text-black font-bold">O</span>
                  </div>
                  <h3 className="font-semibold">Types de véhicules</h3>
                </div>
                <p className="text-gray-700 italic">
                  "Quels types de minibus proposez-vous pour un groupe de 15 personnes ?"
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-full bg-hermes-green flex items-center justify-center mr-2">
                    <span className="text-black font-bold">O</span>
                  </div>
                  <h3 className="font-semibold">Équipements disponibles</h3>
                </div>
                <p className="text-gray-700 italic">
                  "Vos autocars sont-ils équipés de WiFi et de prises USB ?"
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-full bg-hermes-green flex items-center justify-center mr-2">
                    <span className="text-black font-bold">O</span>
                  </div>
                  <h3 className="font-semibold">Réservations et disponibilité</h3>
                </div>
                <p className="text-gray-700 italic">
                  "Combien de temps à l'avance faut-il réserver pour un voyage scolaire ?"
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-full bg-hermes-green flex items-center justify-center mr-2">
                    <span className="text-black font-bold">O</span>
                  </div>
                  <h3 className="font-semibold">Services spéciaux</h3>
                </div>
                <p className="text-gray-700 italic">
                  "Proposez-vous des services pour les personnes à mobilité réduite ?"
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-full bg-hermes-green flex items-center justify-center mr-2">
                    <span className="text-black font-bold">O</span>
                  </div>
                  <h3 className="font-semibold">Conditions de voyage</h3>
                </div>
                <p className="text-gray-700 italic">
                  "Quelles sont les conditions d'annulation pour une réservation ?"
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button className="bg-gray-800 hover:bg-gray-700 text-white">
              <MessageSquare className="mr-2 h-4 w-4" />
              Discuter avec Otto
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gray-900 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Occasions très spéciales uniquement</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            La demande de devis est réservée exclusivement pour les occasions très spéciales. Notre
            service premium est conçu pour rendre vos événements exceptionnels inoubliables.
          </p>
          <Button className="bg-hermes-green hover:bg-hermes-green/80 text-black px-8 py-6 text-lg">
            DEMANDER UN DEVIS
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-lg font-bold mb-4">À propos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Qui sommes-nous</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Nos engagements</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Nos partenaires</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Mentions légales</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Location d'autocar</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Location de minibus</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Transport scolaire</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Transfert aéroport</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Informations</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">FAQ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Réglementation</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Conditions générales</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="text-gray-600">+(33) 09 80 40 04 84</span>
                </li>
                <li className="flex items-center">
                  <span className="text-gray-600">Du lundi au vendredi, de 09h à 18h</span>
                </li>
              </ul>
              <Button className="mt-4 border border-gray-300 bg-white text-black hover:bg-gray-100">
                Contactez-nous
              </Button>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
            <p>2025 Autocar-Location.com - Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
