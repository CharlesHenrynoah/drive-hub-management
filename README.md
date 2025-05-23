Autocar Location & Hermes
Vue d'ensemble
Ce dépôt contient deux applications complémentaires :

    Autocar Location : Site web public pour la location de véhicules de transport
    Hermes : Back office de gestion pour l'administration des flottes, chauffeurs et missions

Cette plateforme complète permet aux entreprises de gérer efficacement leurs ressources de transport, de planifier des missions et de suivre les performances écologiques, tout en offrant une interface de réservation aux clients.
Technologies
Le projet utilise un stack technologique moderne :

    Frontend : React 18 avec TypeScript
    Build Tool : Vite
    UI : Radix UI, Tailwind CSS, Shadcn UI
    Gestion d'état : React Query (TanStack Query)
    Formulaires : React Hook Form avec validation Zod
    Routing : React Router DOM
    Visualisation : Recharts, React Big Calendar, React Day Picker
    Backend : Supabase (PostgreSQL, Auth, Storage, Functions)

Prérequis

    Node.js (v18+)
    npm, yarn ou pnpm
    Compte Supabase (pour le backend)

Installation

    Clonez le dépôt :

bash

git clone https://github.com/CharlesHenrynoah/drive-hub-management.git
cd drive-hub-management

    Installez les dépendances :

bash

npm install
# ou
yarn install
# ou
pnpm install

    Configuration de Supabase :
        Créez un projet sur Supabase
        Configurez les variables d'environnement en créant un fichier .env à la racine du projet :

    VITE_SUPABASE_URL=votre_url_supabase
    VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase

Développement
Lancez le serveur de développement :
bash

npm run dev
# ou
yarn dev
# ou
pnpm dev

L'application sera disponible à l'adresse http://localhost:8080.
Structure du projet

drive-hub-management/
├── public/                  # Ressources statiques
├── src/                     # Code source
│   ├── components/          # Composants React
│   │   ├── api/             # Composants liés aux appels API
│   │   ├── booking/         # Gestion des réservations (Autocar Location )
│   │   ├── companies/       # Gestion des entreprises (Hermes)
│   │   ├── dashboard/       # Composants du tableau de bord (Hermes)
│   │   ├── drivers/         # Gestion des chauffeurs (Hermes)
│   │   ├── fleets/          # Gestion des flottes (Hermes)
│   │   ├── missions/        # Gestion des missions (Hermes)
│   │   ├── ui/              # Composants UI génériques
│   │   └── vehicles/        # Gestion des véhicules (Hermes)
│   ├── constants/           # Constantes de l'application
│   ├── docs/                # Documentation interne
│   ├── hooks/               # Hooks React personnalisés
│   ├── integrations/        # Intégrations externes
│   │   └── supabase/        # Configuration Supabase
│   ├── lib/                 # Bibliothèques et utilitaires
│   ├── pages/               # Pages de l'application
│   │   ├── admin/           # Pages d'administration (Hermes)
│   │   └── background/      # Pages d'arrière-plan
│   ├── types/               # Types TypeScript
│   └── utils/               # Fonctions utilitaires
├── supabase/                # Configuration et fonctions Supabase
│   ├── config.toml          # Configuration Supabase
│   └── functions/           # Fonctions Edge Supabase
└── ...                      # Fichiers de configuration

Scripts disponibles

    npm run dev : Lance le serveur de développement
    npm run build : Compile l'application pour la production
    npm run build:dev : Compile l'application en mode développement
    npm run lint : Exécute ESLint pour vérifier le code
    npm run preview : Prévisualise la version de production localement

Applications
Autocar Location (Site Web Public)
Le site web Autocar Location est l'interface publique permettant aux clients de :

    Consulter les véhicules disponibles
    Effectuer des réservations
    Suivre l'état de leurs commandes
    Contacter le service client

Hermes (Back Office)
Hermes est le back office d'administration permettant aux gestionnaires de :

    Gérer les flottes de véhicules
    Administrer les chauffeurs
    Planifier et suivre les missions
    Gérer les entreprises clientes
    Analyser les performances et les statistiques
    Calculer les scores écologiques

Fonctions Supabase
Le projet utilise plusieurs fonctions Edge Supabase pour la logique métier :

    api-auth : Authentification API
    calculate-ecological-score : Calcul de score écologique
    companies-with-resources : Gestion des ressources des entreprises
    create-mission : Création de missions
    drivers-available : Vérification de la disponibilité des chauffeurs
    fleets-vehicles : Gestion des véhicules par flotte
    update-mission-status : Mise à jour du statut des missions
    update-van-capacity : Mise à jour de la capacité des fourgons
    vehicles-available : Vérification de la disponibilité des véhicules

Architecture
L'application suit une architecture modulaire avec une séparation claire des préoccupations :

    Components : Organisés par domaine métier (véhicules, chauffeurs, missions)
    Pages : Composants de niveau supérieur représentant les routes de l'application
    Hooks : Logique réutilisable encapsulée dans des hooks React
    Integrations : Connexion avec des services externes comme Supabase
    Types : Définitions de types TypeScript pour assurer la cohérence du typage

La séparation entre le site web public (Autocar Location) et le back office (Hermes) est principalement gérée au niveau des routes et des composants spécifiques, tout en partageant une base de code commune pour les fonctionnalités transversales.
Contribution

    Forkez le dépôt
    Créez une branche pour votre fonctionnalité (git checkout -b feature/amazing-feature)
    Committez vos changements (git commit -m 'Add some amazing feature')
    Poussez vers la branche (git push origin feature/amazing-feature)
    Ouvrez une Pull Request

Conventions de code

    Utilisez TypeScript pour tout le code
    Suivez les règles ESLint configurées dans le projet
    Utilisez les composants UI existants de Shadcn/Radix
    Documentez les nouvelles fonctionnalités dans le dossier docs
    Préfixez les composants spécifiques à Hermes avec Admin ou placez-les dans les dossiers appropriés

Déploiement
L'application peut être déployée sur n'importe quel service compatible avec les applications Vite/React :

    Construisez l'application :

bash

npm run build

    Déployez le contenu du dossier dist sur votre service d'hébergement préféré.

