
export interface Driver {
  id: string;
  id_chauffeur: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  piece_identite: string;
  certificat_medical: string;
  justificatif_domicile: string;
  photo?: string;
  date_debut_activite: string;
  note_chauffeur: number;
  disponible: boolean;
  id_entreprise: string;
  ville?: string;
}
