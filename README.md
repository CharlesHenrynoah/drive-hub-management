# Autocar Location & Hermes – Vue d'ensemble

Ce dépôt contient deux applications complémentaires :

- **Autocar Location** : Site web public pour la location de véhicules de transport  
- **Hermes** : Back office de gestion pour l'administration des flottes, chauffeurs et missions

Cette plateforme permet aux entreprises de gérer efficacement leurs ressources de transport, de planifier des missions, de suivre les performances écologiques, tout en offrant une interface de réservation intuitive pour les clients.

---

## 🛠️ Technologies

Stack moderne utilisé :

- **Frontend** : React 18 + TypeScript  
- **Build Tool** : Vite  
- **UI** : Radix UI, Tailwind CSS, Shadcn UI  
- **Gestion d’état** : React Query (TanStack Query)  
- **Formulaires** : React Hook Form + Zod  
- **Routing** : React Router DOM  
- **Visualisation** : Recharts, React Big Calendar, React Day Picker  
- **Backend** : Supabase (PostgreSQL, Auth, Storage, Functions)

---

## ⚙️ Prérequis

- Node.js (v18+)  
- npm, yarn ou pnpm  
- Compte Supabase

---

## 🚀 Installation

### Cloner le dépôt

```bash
git clone https://github.com/CharlesHenrynoah/drive-hub-management.git
cd drive-hub-management
```

### Installer les dépendances

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### Configuration de Supabase

1. Créez un projet sur [Supabase](https://supabase.com)  
2. Créez un fichier `.env` à la racine avec :

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🧪 Lancer le développement

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

L'application sera disponible sur : [http://localhost:8080](http://localhost:8080)

---

## 🗂️ Structure du projet

```
drive-hub-management/
├── public/                # Ressources statiques
├── src/                  
│   ├── components/        # Composants organisés par domaine métier
│   │   ├── api/           
│   │   ├── booking/       # Autocar Location
│   │   ├── companies/     # Hermes
│   │   ├── dashboard/     # Hermes
│   │   ├── drivers/       # Hermes
│   │   ├── fleets/        # Hermes
│   │   ├── missions/      # Hermes
│   │   ├── ui/            
│   │   └── vehicles/      # Hermes
│   ├── constants/
│   ├── docs/
│   ├── hooks/
│   ├── integrations/
│   │   └── supabase/
│   ├── lib/
│   ├── pages/
│   │   ├── admin/
│   │   └── background/
│   ├── types/
│   └── utils/
├── supabase/
│   ├── config.toml
│   └── functions/
└── ...
```

---

## 📦 Scripts disponibles

```bash
npm run dev         # Développement
npm run build       # Production
npm run build:dev   # Build dev
npm run lint        # Lint du code
npm run preview     # Preview de prod
```

---

## 🌐 Applications

### 🔹 Autocar Location (Public)

Fonctionnalités pour les clients :

- Voir les véhicules  
- Réserver  
- Suivre les commandes  
- Contacter le support  

### 🔸 Hermes (Back Office)

Fonctionnalités pour les gestionnaires :

- Gérer flottes, chauffeurs, entreprises  
- Planifier et suivre des missions  
- Calculer les scores écologiques  
- Suivre des statistiques  

---

## 🧮 Fonctions Supabase

Liste des fonctions Edge utilisées :

- `api-auth`  
- `calculate-ecological-score`  
- `companies-with-resources`  
- `create-mission`  
- `drivers-available`  
- `fleets-vehicles`  
- `update-mission-status`  
- `update-van-capacity`  
- `vehicles-available`  

---

## 🧱 Architecture

- **Components** : Organisés par domaine  
- **Pages** : Routes et vues principales  
- **Hooks** : Logique métier réutilisable  
- **Integrations** : Services externes (ex. Supabase)  
- **Types** : Typage cohérent  

> La séparation entre Autocar Location (public) et Hermes (admin) se fait via les routes et composants spécifiques, tout en partageant un socle commun.

---

## 🤝 Contribution

1. Forkez le repo  
2. Créez une branche : `git checkout -b feature/awesome-feature`  
3. Committez : `git commit -m "feat: add awesome feature"`  
4. Poussez : `git push origin feature/awesome-feature`  
5. Ouvrez une **Pull Request**

---

## 🧭 Conventions de code

- TypeScript obligatoire  
- Suivre les règles ESLint  
- Utiliser Shadcn/Radix UI  
- Documenter dans `/docs`  
- Préfixer les composants Hermes avec `Admin` ou placer dans le bon dossier

---

## 🚢 Déploiement

```bash
npm run build
```

Déployez le contenu du dossier `dist/` sur un hébergeur compatible Vite/React.


