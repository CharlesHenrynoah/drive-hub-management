
// Liste des types de carburants
export const fuelTypes = [
  "Diesel",
  "Essence",
  "Électrique",
  "Hybride",
  "GNV",
  "Biodiesel",
  "Hydrogène",
];

// Liste des statuts de véhicule
export const vehicleStatuses = ["Disponible", "En maintenance", "Hors service", "En mission"];

// Liste des villes pour la localisation
export const cities = [
  "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg",
  "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre",
  "Saint-Étienne", "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes", "Clermont-Ferrand"
];

// Liste des types de véhicules - UNIQUEMENT les 6 types de la partie chauffeur
export const vehicleTypes = [
  { value: "Minibus", label: "Minibus" },
  { value: "Minicar", label: "Minicar" },
  { value: "Autocar Standard", label: "Autocar Standard" },
  { value: "Autocar Grand Tourisme", label: "Autocar Grand Tourisme" },
  { value: "VTC", label: "VTC" },
  { value: "Berline", label: "Berline" }
];

// Capacités par défaut pour chaque type de véhicule
export const getDefaultCapacityByType = (vehicleType: string): number => {
  switch(vehicleType) {
    case "Minibus":
      return 18;
    case "Minicar":
      return 25;
    case "Autocar Standard":
      return 50;
    case "Autocar Grand Tourisme":
      return 45;
    case "VTC":
      return 4;
    case "Berline":
      return 4;
    default:
      return 0;
  }
};
