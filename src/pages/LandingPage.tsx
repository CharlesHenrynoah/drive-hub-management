import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Leaf, Clock, Medal, Scale, CheckCircle, MessageSquare, Calendar, Users, Bus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { DatePicker } from "@/components/ui/date-picker";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import { cities } from "@/components/vehicles/constants/vehicleFormConstants";
import { europeanCapitals } from "@/constants/locations";

interface Fleet {
  id: string;
  name: string;
  description?: string;
  company_name?: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  type: string;
  capacity: number;
  registration: string;
  photo_url?: string;
}

interface Driver {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  photo?: string;
}

interface FleetRecommendation {
  fleet: Fleet;
  availableDrivers: Driver[];
  availableVehicles: Vehicle[];
}

const LandingPage = () => {
  const [departureDate, setDepartureDate] = useState<Date | undefined>(new Date());
  const [passengerCount, setPassengerCount] = useState<string>("20");
  const [departure, setDeparture] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<FleetRecommendation[]>([]);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  
  const navigate = useNavigate();

  // Format cities for Combobox
  const cityOptions = cities.map(city => ({
    label: city,
    value: city
  }));
  
  // Combine French cities and European capitals for destination options
  const destinationOptions = [...cities, ...europeanCapitals]
    .sort((a, b) => a.localeCompare(b, 'fr'))
    .map(city => ({
      label: city,
      value: city
    }));

  const handleChatWithOtto = () => {
    const message = `Je souhaite effectuer un déplacement ${departure ? `de ${departure}` : ""} ${destination ? `à ${destination}` : ""} ${departureDate ? `le ${format(departureDate, "d MMMM yyyy", { locale: fr })}` : ""}, nous sommes un groupe de ${passengerCount} personnes. ${additionalInfo}`;
    navigate("/chatbotOtto", { state: { initialMessage: message } });
  };

  const handleSearch = async () => {
    if (!departureDate) {
      toast.error("Veuillez sélectionner une date de départ");
      return;
    }

    if (!departure) {
      toast.error("Veuillez sélectionner un lieu de départ");
      return;
    }

    setLoading(true);
    setSearchPerformed(true);
    
    try {
      // Formatage de la date pour l'API
      const formattedDate = format(departureDate, "yyyy-MM-dd");
      
      // 1. Récupérer les véhicules disponibles à cette date, dans ce lieu, avec capacité suffisante
      const vehiclesResponse = await fetch(
        `https://nsfphygihklucqjiwngl.supabase.co/functions/v1/vehicles-available?date=${formattedDate}&location=${departure}&passengers=${passengerCount}`, 
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZnBoeWdpaGtsdWNxaml3bmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzIyNzIsImV4cCI6MjA2MTUwODI3Mn0.Ms15OGYl01a9zK8WuiEOKzUflMipxESJ_u3PI4cFMbc"}`
          }
        }
      );
      
      if (!vehiclesResponse.ok) throw new Error("Échec de récupération des véhicules disponibles");
      const vehiclesData = await vehiclesResponse.json();
      const availableVehicles = vehiclesData.vehicles || [];
      
      if (availableVehicles.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }
      
      // Regrouper les véhicules par entreprise
      const vehiclesByCompany = {};
      for (const vehicle of availableVehicles) {
        if (vehicle.company_id) {
          if (!vehiclesByCompany[vehicle.company_id]) {
            vehiclesByCompany[vehicle.company_id] = [];
          }
          vehiclesByCompany[vehicle.company_id].push(vehicle);
        }
      }
      
      const fleetRecommendations: FleetRecommendation[] = [];
      
      // Pour chaque entreprise ayant des véhicules disponibles
      for (const companyId in vehiclesByCompany) {
        const companyVehicles = vehiclesByCompany[companyId];
        
        // Récupérer les informations de l'entreprise
        const { data: company } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', companyId)
          .single();
        
        if (!company) continue;
        
        // Récupérer les flottes liées à cette entreprise
        const { data: fleets } = await supabase
          .from('fleets')
          .select('id, name, description')
          .eq('company_id', companyId);
        
        if (!fleets || fleets.length === 0) continue;
        
        // Pour chaque flotte, vérifier quels véhicules lui appartiennent
        for (const fleet of fleets) {
          const { data: fleetVehiclesData } = await supabase
            .from('fleet_vehicles')
            .select('vehicle_id')
            .eq('fleet_id', fleet.id);
          
          if (!fleetVehiclesData || fleetVehiclesData.length === 0) continue;
          
          const fleetVehicleIds = fleetVehiclesData.map(fv => fv.vehicle_id);
          const fleetAvailableVehicles = companyVehicles.filter(vehicle => 
            fleetVehicleIds.includes(vehicle.id)
          );
          
          if (fleetAvailableVehicles.length === 0) continue;
          
          // Pour chaque véhicule disponible, trouver des chauffeurs qui peuvent le conduire
          const vehicleTypes = [...new Set(fleetAvailableVehicles.map(v => v.vehicle_type))].filter(Boolean);
          
          // Si aucun type de véhicule n'est défini, passer au suivant
          if (vehicleTypes.length === 0) continue;
          
          let fleetDrivers = [];
          
          // Pour chaque type de véhicule, récupérer les chauffeurs qui peuvent le conduire
          for (const vehicleType of vehicleTypes) {
            // Récupérer les chauffeurs disponibles pour ce lieu et ce type de véhicule
            const driversResponse = await fetch(
              `https://nsfphygihklucqjiwngl.supabase.co/functions/v1/drivers-available?date=${formattedDate}&location=${departure}&vehicle_type=${vehicleType}&company_id=${companyId}`,
              {
                headers: {
                  Authorization: `Bearer ${import.meta.env.VITE_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZnBoeWdpaGtsdWNxaml3bmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzIyNzIsImV4cCI6MjA2MTUwODI3Mn0.Ms15OGYl01a9zK8WuiEOKzUflMipxESJ_u3PI4cFMbc"}`
                }
              }
            );
            
            if (!driversResponse.ok) continue;
            const driversData = await driversResponse.json();
            
            // Filtrer les chauffeurs associés à cette flotte
            const { data: fleetDriversData } = await supabase
              .from('fleet_drivers')
              .select('driver_id')
              .eq('fleet_id', fleet.id);
            
            if (!fleetDriversData || fleetDriversData.length === 0) continue;
            
            const fleetDriverIds = fleetDriversData.map(fd => fd.driver_id);
            const typeDrivers = driversData.drivers.filter(driver => fleetDriverIds.includes(driver.id));
            
            fleetDrivers = [...fleetDrivers, ...typeDrivers];
          }
          
          // Dédupliquer les chauffeurs par ID
          fleetDrivers = fleetDrivers.filter((driver, index, self) => 
            index === self.findIndex(d => d.id === driver.id)
          );
          
          if (fleetDrivers.length > 0) {
            fleetRecommendations.push({
              fleet: {
                ...fleet,
                company_name: company.name
              },
              availableDrivers: fleetDrivers,
              availableVehicles: fleetAvailableVehicles
            });
          }
        }
      }
      
      setRecommendations(fleetRecommendations);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast.error("Une erreur est survenue lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="max-w-3xl mx-auto bg-white rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Date de départ</label>
                <DatePicker date={departureDate} setDate={setDepartureDate} placeholder="Sélectionnez une date" className="w-full" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Nombre de passagers</label>
                <Input 
                  type="number" 
                  placeholder="Nombre de passagers" 
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Lieu de départ</label>
                <Combobox 
                  items={cityOptions}
                  value={departure}
                  onChange={setDeparture}
                  placeholder="Sélectionnez une ville de départ" 
                  emptyMessage="Aucune ville trouvée"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Destination</label>
                <Combobox 
                  items={destinationOptions}
                  value={destination}
                  onChange={setDestination}
                  placeholder="Sélectionnez une destination" 
                  emptyMessage="Aucune destination trouvée"
                  className="w-full"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1 font-medium">Informations supplémentaires</label>
              <Textarea 
                placeholder="Précisez vos besoins (durée, équipements souhaités, etc.)" 
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <Button 
                className="w-full md:w-auto bg-hermes-green text-black hover:bg-hermes-green/80"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? "Recherche en cours..." : "Rechercher"}
              </Button>
              <Button 
                className="w-full md:w-auto bg-gray-700 hover:bg-gray-600"
                onClick={handleChatWithOtto}
              >
                Discuter avec Otto
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations Section - appears after search */}
      {searchPerformed && (
        <section className="py-12 container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            {recommendations.length > 0 ? "Recommandations pour votre trajet" : "Aucune recommandation disponible"}
          </h2>
          
          {recommendations.length > 0 ? (
            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {recommendations.map((recommendation, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                    <div className="p-2">
                      <Card className="h-full">
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="mb-4">
                            <h3 className="text-xl font-bold">{recommendation.fleet.name}</h3>
                            <p className="text-gray-500">{recommendation.fleet.company_name}</p>
                            {recommendation.fleet.description && <p className="mt-2">{recommendation.fleet.description}</p>}
                          </div>
                          
                          <div className="mb-4 flex-grow">
                            <h4 className="font-medium mb-2 flex items-center">
                              <Bus className="h-4 w-4 mr-1" /> 
                              Véhicules disponibles ({recommendation.availableVehicles.length})
                            </h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {recommendation.availableVehicles.slice(0, 3).map((vehicle, idx) => (
                                <div key={idx} className="flex items-center p-2 bg-gray-50 rounded">
                                  {vehicle.photo_url ? (
                                    <img 
                                      src={vehicle.photo_url} 
                                      alt={`${vehicle.brand} ${vehicle.model}`}
                                      className="h-8 w-12 object-cover mr-2 rounded"
                                    />
                                  ) : (
                                    <div className="h-8 w-12 bg-gray-200 mr-2 rounded flex items-center justify-center">
                                      <Bus className="h-4 w-4 text-gray-500" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium">{vehicle.brand} {vehicle.model}</p>
                                    <p className="text-xs text-gray-500">{vehicle.capacity} passagers</p>
                                  </div>
                                </div>
                              ))}
                              {recommendation.availableVehicles.length > 3 && (
                                <p className="text-xs text-gray-500 italic">
                                  + {recommendation.availableVehicles.length - 3} autres véhicules
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium mb-2 flex items-center">
                              <Users className="h-4 w-4 mr-1" /> 
                              Chauffeurs disponibles ({recommendation.availableDrivers.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {recommendation.availableDrivers.slice(0, 3).map((driver, idx) => (
                                <div key={idx} className="flex items-center">
                                  {driver.photo ? (
                                    <img 
                                      src={driver.photo} 
                                      alt={`${driver.prenom} ${driver.nom}`}
                                      className="h-8 w-8 rounded-full mr-1"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 bg-gray-200 rounded-full mr-1 flex items-center justify-center">
                                      <Users className="h-4 w-4 text-gray-500" />
                                    </div>
                                  )}
                                  <span className="text-sm">{driver.prenom} {driver.nom.charAt(0)}.</span>
                                </div>
                              ))}
                              {recommendation.availableDrivers.length > 3 && (
                                <span className="text-xs text-gray-500 italic">
                                  + {recommendation.availableDrivers.length - 3} autres
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <Button className="mt-auto" onClick={() => {
                            const message = `Je souhaite réserver avec la flotte ${recommendation.fleet.name} pour un déplacement ${departure ? `de ${departure}` : ""} ${destination ? `à ${destination}` : ""} ${departureDate ? `le ${format(departureDate, "d MMMM yyyy", { locale: fr })}` : ""}, nous sommes un groupe de ${passengerCount} personnes. ${additionalInfo}`;
                            navigate("/chatbotOtto", { state: { initialMessage: message } });
                          }}>
                            Demander un devis
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-end space-x-2 mt-4">
                <CarouselPrevious className="static transform-none" />
                <CarouselNext className="static transform-none" />
              </div>
            </Carousel>
          ) : (
            <div className="text-center max-w-md mx-auto">
              <p className="mb-4">
                {departure ? 
                  `Aucun véhicule n'est disponible à ${departure} pour ${passengerCount} passagers à cette date. Veuillez modifier votre recherche ou contacter notre service client.` : 
                  "Veuillez sélectionner un lieu de départ pour votre recherche."
                }
              </p>
              <Button onClick={handleChatWithOtto}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Discuter avec Otto
              </Button>
            </div>
          )}
        </section>
      )}

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
            <Button 
              className="bg-gray-800 hover:bg-gray-700 text-white"
              onClick={() => navigate("/chatbotOtto")}
            >
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
