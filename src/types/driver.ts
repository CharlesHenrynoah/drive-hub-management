
export interface Driver {
  ID_Chauffeur: string;
  Nom: string;
  Prénom: string;
  Email: string;
  Téléphone: string;
  Pièce_Identité: string;
  Certificat_Médical: string;
  Justificatif_Domicile: string;
  Expérience: number;
  Note_Chauffeur: number;
  Missions_Futures: string[];
  Photo: string;
  ID_Entreprise: string;
  Disponible: boolean;
}
