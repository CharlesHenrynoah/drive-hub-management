import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Leaf, Clock, Medal, Scale, CheckCircle, MessageSquare, Calendar, Users, Bus, Phone, User, Mail, Building } from "lucide-react";
import backgroundImage from "@/pages/background/background.png";
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
import { BookingModal } from "@/components/booking/BookingModal";
import { Vehicle } from "@/types/vehicle";
import { Driver } from "@/types/driver";
import { TimePicker } from "@/components/ui/time-picker";

export interface Fleet {
  id: string;
  name: string;
  description?: string;
  company_name?: string;
}

export interface FleetRecommendation {
  fleet: Fleet;
  availableDrivers: Driver[];
  availableVehicles: Vehicle[];
}

const LandingPage = () => {
  const [departureDate, setDepartureDate] = useState<Date | undefined>(new Date());
  const [departureTime, setDepartureTime] = useState<string>("09:00");
  const [passengerCount, setPassengerCount] = useState<string>("20");
  const [departure, setDeparture] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<FleetRecommendation[]>([]);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<FleetRecommendation | null>(null);
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  
  // Calcul de la date par défaut (demain)
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]; // Format YYYY-MM-DD
  };

  // États pour le formulaire de devis
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);
  const [quoteFormData, setQuoteFormData] = useState({
    name: "",
    email: "",
    phone: "",
    departure: "",
    destination: "",
    departureDate: getTomorrowDate(),
    departureTime: "09:00",
    passengers: "1",
    message: ""
  });
  
  const navigate = useNavigate();

  // Format cities for Combobox
  const cityOptions = cities.map((city) => ({
    value: city,
    label: city,
  }));
  
  // Fonctions pour gérer le formulaire de devis
  const handleQuoteFormOpen = () => {
    setIsQuoteModalOpen(true);
  };
  
  const handleQuoteFormClose = () => {
    setIsQuoteModalOpen(false);
  };
  
  const handleQuoteFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validations spécifiques selon le type de champ
    let validatedValue = value;
    
    switch (name) {
      case 'name':
        // Accepte uniquement les lettres, espaces, tirets, apostrophes
        validatedValue = value.replace(/[^a-zA-Z\u00C0-\u017F\s\-']/g, '');
        break;
      
      case 'phone':
        // Accepte uniquement les chiffres, +, espaces et parenthèses
        validatedValue = value.replace(/[^0-9+()\s]/g, '');
        break;
      
      case 'departure':
      case 'destination':
        // Accepte les lettres, chiffres, espaces, tirets (pour les noms de villes composés)
        validatedValue = value.replace(/[^a-zA-Z0-9\u00C0-\u017F\s\-]/g, '');
        break;
      
      case 'passengers':
        // S'assure que c'est un nombre positif
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 1) {
          validatedValue = value === '' ? '' : '1';
        }
        break;
        
      default:
        // Pas de validation spéciale pour les autres champs
        break;
    }
    
    setQuoteFormData(prev => ({
      ...prev,
      [name]: validatedValue
    }));
  };
  
  const handleQuoteFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulation d'envoi d'email au service client
    // En production, vous utiliserez un service d'email réel
    console.log("Demande de devis envoyée:", quoteFormData);
    
    // Fermeture du formulaire et ouverture de la confirmation
    setIsQuoteModalOpen(false);
    setIsConfirmationModalOpen(true);
    
    // Réinitialisation du formulaire
    setQuoteFormData({
      name: "",
      email: "",
      phone: "",
      departure: "",
      destination: "",
      departureDate: getTomorrowDate(),
      departureTime: "09:00",
      passengers: "1",
      message: ""
    });
  };
  
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
    // Validation des champs obligatoires
    if (!departureDate) {
      toast.error("Veuillez sélectionner une date de départ");
      return;
    }

    if (!departure) {
      toast.error("Veuillez sélectionner un lieu de départ");
      return;
    }

    if (!destination) {
      toast.error("Veuillez sélectionner une destination");
      return;
    }

    if (!passengerCount || parseInt(passengerCount) <= 0) {
      toast.error("Veuillez indiquer un nombre de passagers valide");
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
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!vehiclesResponse.ok) throw new Error("Échec de récupération des véhicules disponibles");
      const vehiclesData = await vehiclesResponse.json();
      const availableVehicles = vehiclesData.vehicles || [];
      
      console.log("Véhicules disponibles:", availableVehicles);
      
      if (availableVehicles.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }
      
      // Regrouper les véhicules par entreprise
      const vehiclesByCompany: Record<string, Vehicle[]> = {};
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
        
        if (!fleets || fleets.length === 0) {
          // Si l'entreprise n'a pas de flotte, créer une "flotte par défaut" pour afficher les véhicules quand même
          fleetRecommendations.push({
            fleet: {
              id: `default-${companyId}`,
              name: `${company.name} - Services`,
              description: "Véhicules disponibles",
              company_name: company.name
            },
            availableDrivers: [], // Nous allons chercher des chauffeurs pour cette flotte ci-dessous
            availableVehicles: companyVehicles
          });
          continue;
        }
        
        let anyVehicleAssigned = false;
        
        // Pour chaque flotte, vérifier quels véhicules lui appartiennent
        for (const fleet of fleets) {
          const { data: fleetVehiclesData } = await supabase
            .from('fleet_vehicles')
            .select('vehicle_id')
            .eq('fleet_id', fleet.id);
          
          let fleetAvailableVehicles = [];
          
          if (fleetVehiclesData && fleetVehiclesData.length > 0) {
            const fleetVehicleIds = fleetVehiclesData.map(fv => fv.vehicle_id);
            fleetAvailableVehicles = companyVehicles.filter(vehicle => 
              fleetVehicleIds.includes(vehicle.id)
            );
            
            if (fleetAvailableVehicles.length > 0) {
              anyVehicleAssigned = true;
            }
          } else {
            // Si aucun véhicule n'est associé à cette flotte spécifique, continuer
            continue;
          }
          
          if (fleetAvailableVehicles.length === 0) continue;
          
          // Pour chaque véhicule disponible, trouver des chauffeurs qui peuvent le conduire
          const vehicleTypes = [...new Set(fleetAvailableVehicles.map(v => v.vehicle_type))].filter(Boolean);
          
          let fleetDrivers = [];
          
          // Pour chaque type de véhicule, récupérer les chauffeurs qui peuvent le conduire
          for (const vehicleType of vehicleTypes.length > 0 ? vehicleTypes : ['standard']) {
            // Récupérer les chauffeurs disponibles pour ce lieu et ce type de véhicule
            const driversResponse = await fetch(
              `https://nsfphygihklucqjiwngl.supabase.co/functions/v1/drivers-available?date=${formattedDate}&location=${departure}&vehicle_type=${vehicleType}&company_id=${companyId}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (!driversResponse.ok) continue;
            const driversData = await driversResponse.json();
            
            console.log("Chauffeurs disponibles pour type", vehicleType, ":", driversData.drivers);
            
            // Filtrer les chauffeurs associés à cette flotte
            const { data: fleetDriversData } = await supabase
              .from('fleet_drivers')
              .select('driver_id')
              .eq('fleet_id', fleet.id);
            
            let typeDrivers = [];
            
            if (fleetDriversData && fleetDriversData.length > 0) {
              const fleetDriverIds = fleetDriversData.map(fd => fd.driver_id);
              typeDrivers = driversData.drivers.filter((driver: Driver) => fleetDriverIds.includes(driver.id));
            } else {
              // Si aucun chauffeur n'est associé à cette flotte, utiliser tous les chauffeurs disponibles
              typeDrivers = driversData.drivers;
            }
            
            fleetDrivers = [...fleetDrivers, ...typeDrivers];
          }
          
          // Dédupliquer les chauffeurs par ID
          fleetDrivers = fleetDrivers.filter((driver: Driver, index: number, self: Driver[]) => 
            index === self.findIndex((d: Driver) => d.id === driver.id)
          );
          
          if (fleetAvailableVehicles.length > 0) {
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
        
        // Si aucun véhicule n'est assigné à aucune flotte, créer une recommandation par défaut
        if (!anyVehicleAssigned) {
          // Récupérer les chauffeurs pour l'entreprise
          const driversResponse = await fetch(
            `https://nsfphygihklucqjiwngl.supabase.co/functions/v1/drivers-available?date=${formattedDate}&location=${departure}&company_id=${companyId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          let companyDrivers = [];
          if (driversResponse.ok) {
            const driversData = await driversResponse.json();
            companyDrivers = driversData.drivers || [];
          }
          
          fleetRecommendations.push({
            fleet: {
              id: `default-${companyId}`,
              name: `${company.name} - Services`,
              description: "Véhicules disponibles",
              company_name: company.name
            },
            availableDrivers: companyDrivers,
            availableVehicles: companyVehicles
          });
        }
      }
      
      setRecommendations(fleetRecommendations);
      console.log("Recommandations générées:", fleetRecommendations);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast.error("Une erreur est survenue lors de la recherche");
    } finally {
      setLoading(false);
    }
  };
  
  const handleBookNow = (recommendation: FleetRecommendation) => {
    setSelectedRecommendation(recommendation);
    setIsBookingModalOpen(true);
  };

  const handleContactInfoChange = (field: string, value: string) => {
    setContactInfo({
      ...contactInfo,
      [field]: value
    });
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
      <section className="relative bg-gray-300 md:bg-[url('/placeholder.svg')] bg-cover bg-center py-16">
        <div 
          className="absolute inset-0 md:bg-black/30"
          style={{
            background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Location autocar, bus, minibus avec chauffeur
          </h1>
          <div className="max-w-3xl mx-auto bg-white rounded-lg p-6 shadow-lg">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">Date de départ <span className="text-red-500">*</span></label>
                  <DatePicker 
                    date={departureDate} 
                    setDate={setDepartureDate} 
                    placeholder="Sélectionnez une date" 
                    className="w-full h-10" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">Heure de départ <span className="text-red-500">*</span></label>
                  <TimePicker 
                    time={departureTime} 
                    setTime={setDepartureTime} 
                    placeholder="Sélectionnez une heure" 
                    label=""
                    className="w-full h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">Nombre de passagers <span className="text-red-500">*</span></label>
                  <Input 
                    type="number" 
                    placeholder="Nombre de passagers" 
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(e.target.value)}
                    min="1"
                    required
                    className="w-full h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">Lieu de départ <span className="text-red-500">*</span></label>
                  <Combobox 
                    items={cityOptions}
                    value={departure}
                    onChange={setDeparture}
                    placeholder="Sélectionnez une ville de départ" 
                    emptyMessage="Aucune ville trouvée"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-gray-700 font-medium">Destination <span className="text-red-500">*</span></label>
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
              
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">Informations supplémentaires</label>
                <Textarea 
                  placeholder="Précisez vos besoins (durée, équipements souhaités, etc.)" 
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="resize-none w-full"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-center pt-4">
                <Button 
                  type="button"
                  className="w-full sm:w-auto bg-hermes-green text-black hover:bg-hermes-green/80 font-medium py-2 px-8"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? "Recherche en cours..." : "Rechercher"}
                </Button>
              </div>
            </form>
            
            <p className="text-sm text-gray-500 italic mt-6">
              <span className="text-red-500">*</span> champs obligatoires
            </p>
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
                          <div className="mb-4 border-b pb-3">
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
                          
                          <Button
                            className="mt-auto bg-hermes-green hover:bg-hermes-green/80 text-black"
                            onClick={() => handleBookNow(recommendation)}
                          >
                            Réserver maintenant
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
              <p>
                {departure ? 
                  `Aucun véhicule n'est disponible à ${departure} pour ${passengerCount} passagers à cette date. Veuillez modifier votre recherche ou contacter notre service client.` : 
                  "Veuillez sélectionner un lieu de départ pour votre recherche."
                }
              </p>
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
              className="bg-black hover:bg-gray-900 text-white"
              onClick={() => navigate("/chatbotOtto")}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Discuter avec Otto
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-black text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Occasions très spéciales uniquement</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            La demande de devis est réservée exclusivement pour les occasions très spéciales. Notre
            service premium est conçu pour rendre vos événements exceptionnels inoubliables.
          </p>
          <Button 
            className="bg-hermes-green hover:bg-hermes-green/80 text-black px-8 py-6 text-lg"
            onClick={handleQuoteFormOpen}
          >
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
      
      {/* Booking Modal */}
      {selectedRecommendation && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          recommendation={selectedRecommendation}
          departureLocation={departure}
          destinationLocation={destination}
          departureDate={departureDate || new Date()}
          passengerCount={passengerCount}
          additionalInfo={additionalInfo}
        />
      )}

      {/* Modal Formulaire de Devis */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Demande de devis</h2>
              <button onClick={handleQuoteFormClose} className="text-gray-500 hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleQuoteFormSubmit} className="space-y-4">
              {/* Première rangée - Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Nom et prénom <span className="text-red-500">*</span></label>
                  <Input 
                    type="text" 
                    name="name" 
                    value={quoteFormData.name} 
                    onChange={handleQuoteFormChange} 
                    required 
                    className="w-full"
                    placeholder="Votre nom et prénom"
                    pattern="[A-Za-z\u00C0-\u017F\s\-']+"
                    title="Veuillez saisir un nom valide (lettres, espaces, tirets et apostrophes uniquement)"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Email <span className="text-red-500">*</span></label>
                  <Input 
                    type="email" 
                    name="email" 
                    value={quoteFormData.email} 
                    onChange={handleQuoteFormChange} 
                    required 
                    className="w-full"
                    placeholder="example@email.com"
                    pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                    title="Veuillez saisir une adresse email valide"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Numéro de téléphone <span className="text-red-500">*</span></label>
                  <Input 
                    type="tel" 
                    name="phone" 
                    value={quoteFormData.phone} 
                    onChange={handleQuoteFormChange} 
                    required 
                    className="w-full"
                    placeholder="+33 6 12 34 56 78"
                    pattern="[0-9+()\s]{10,15}"
                    title="Veuillez saisir un numéro de téléphone valide (chiffres, +, espaces)"
                  />
                </div>
              </div>
              
              {/* Deuxième rangée - Informations de trajet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Lieu de départ <span className="text-red-500">*</span></label>
                  <Input 
                    type="text" 
                    name="departure" 
                    value={quoteFormData.departure} 
                    onChange={handleQuoteFormChange} 
                    required 
                    className="w-full"
                    placeholder="Paris"
                    pattern="[A-Za-z0-9\u00C0-\u017F\s\-]+"
                    title="Veuillez saisir un nom de ville valide (lettres, chiffres, espaces, tirets)"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Destination <span className="text-red-500">*</span></label>
                  <Input 
                    type="text" 
                    name="destination" 
                    value={quoteFormData.destination} 
                    onChange={handleQuoteFormChange} 
                    required 
                    className="w-full"
                    placeholder="Lyon"
                    pattern="[A-Za-z0-9\u00C0-\u017F\s\-]+"
                    title="Veuillez saisir un nom de ville valide (lettres, chiffres, espaces, tirets)"
                  />
                </div>
              </div>
              
              {/* Troisième rangée - Date, heure et nombre de voyageurs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Date de départ <span className="text-red-500">*</span></label>
                  <Input 
                    type="date" 
                    name="departureDate" 
                    value={quoteFormData.departureDate} 
                    onChange={handleQuoteFormChange} 
                    min={getTomorrowDate()} 
                    required 
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Heure <span className="text-red-500">*</span></label>
                  <Input 
                    type="time" 
                    name="departureTime" 
                    value={quoteFormData.departureTime} 
                    onChange={handleQuoteFormChange} 
                    required 
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Nombre de voyageurs <span className="text-red-500">*</span></label>
                  <Input 
                    type="number" 
                    name="passengers" 
                    value={quoteFormData.passengers} 
                    onChange={handleQuoteFormChange} 
                    required 
                    min="1"
                    max="100"
                    className="w-full"
                    title="Veuillez indiquer un nombre de voyageurs entre 1 et 100"
                  />
                </div>
              </div>
              
              {/* Quatrième rangée - Message supplémentaire */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Message supplémentaire</label>
                <Textarea 
                  name="message" 
                  value={quoteFormData.message} 
                  onChange={handleQuoteFormChange} 
                  className="w-full h-24"
                  placeholder="Précisez vos besoins ou questions spécifiques..."
                />
              </div>
              
              <Button type="submit" className="w-full bg-hermes-green hover:bg-hermes-green/80 text-black font-medium py-3">
                Envoyer ma demande
              </Button>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de confirmation */}
      {isConfirmationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 text-center">
            <div className="mb-4 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Demande envoyée !</h2>
            <p className="text-gray-600 mb-6">
              Notre service client a bien reçu votre demande de devis. Vous recevrez une réponse par email dans les plus brefs délais.
            </p>
            
            <Button 
              onClick={() => setIsConfirmationModalOpen(false)} 
              className="bg-hermes-green hover:bg-hermes-green/80 text-black font-medium py-2 px-6"
            >
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
