
export interface Driver {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  piece_identite: string;
  certificat_medical: string;
  justificatif_domicile: string;
  photo?: string;
  id_entreprise: string;
  id_chauffeur: string;
  date_debut_activite: string;
  note_chauffeur: number;
  disponible: boolean;
  created_at: string;
  ville?: string;
}
