# Protecteur — Système de Sécurité Domestique

Application mobile de supervision et de contrôle d'un système de sécurité domestique basé sur la technologie LoRaWAN. L'application permet de surveiller en temps réel l'état de capteurs (température, intrusion, flamme) et de recevoir des alertes par notifications push et SMS.

---

## Table des matières

1. [Aperçu du projet](#aperçu-du-projet)
2. [Architecture technique](#architecture-technique)
3. [Technologies utilisées](#technologies-utilisées)
4. [Structure du projet](#structure-du-projet)
5. [Installation et démarrage](#installation-et-démarrage)
6. [Fonctionnalités](#fonctionnalités)
7. [Écran de l'application](#écrans-de-lapplication)
8. [Données et mocks](#données-et-mocks)
9. [Intégration avec le backend](#intégration-avec-le-backend)
10. [Déploiement Android (Capacitor)](#déploiement-android-capacitor)
11. [Palette de couleurs](#palette-de-couleurs)
12. [Convention de code](#convention-de-code)
13. [État d'avancement](#état-davancement)
14. [Contribuer](#contribuer)

---

## Aperçu du projet

**Protecteur** est la couche Frontend d'un écosystème IoT complet destiné à la sécurité résidentielle. Le système physique repose sur :

- Des **capteurs LoRaWAN** (DHT22 pour la température, HC-SR501 pour l'intrusion, YG1006 pour la détection de flamme)
- Une **gateway ESP32** qui reçoit les données radio et les transmet par MQTT
- Un **backend serveur** qui traite les données, applique la logique d'alerte et stocke l'historique (MongoDB)

Cette application Frontend constitue la **console de supervision mobile**. Elle est conçue pour fonctionner en tant qu'application Android native via **Capacitor**, avec une icône sur l'écran d'accueil et un splash screen animé.

**Statut actuel** : Le Frontend est opérationnel avec des données mockées. Le backend et les capteurs physiques seront connectés ultérieurement.

---

## Architecture technique

```
┌─────────────────────────────────────────────────────┐
│                   CAPTEURS PHYSIQUES                 │
│   DHT22 (Temp) ─── HC-SR501 (PIR) ─── YG1006       │
│         │                │                 │         │
│         └────────────────┼─────────────────┘         │
│                          │                           │
│                    ┌─────┴─────┐                     │
│                    │  ARDUINO   │                     │
│                    │ ATmega328P │                     │
│                    └─────┬─────┘                     │
│                          │ SPI                       │
│                    ┌─────┴─────┐                     │
│                    │  LoRa RFM  │                     │
│                    │    95W     │                     │
│                    └─────┬─────┘                     │
│                          │ Radio 868 MHz              │
└──────────────────────────┼───────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────┐
│                    ┌─────┴─────┐                     │
│                    │  ESP32     │                     │
│                    │ (Gateway)  │                     │
│                    └─────┬─────┘                     │
│                          │ Wi-Fi → MQTT              │
│                    ┌─────┴─────┐                     │
│                    │  Backend   │                     │
│                    │  Node-RED  │                     │
│                    │  MongoDB   │                     │
│                    └─────┬─────┘                     │
│                          │ REST API                  │
│                    ┌─────┴─────┐                     │
│                    │  PROTECTEUR   │ ◄── Cette application│
│                    │  Frontend  │     (Next.js +      │
│                    │ (Capacitor)│      Capacitor)     │
│                    └───────────┘                     │
└─────────────────────────────────────────────────────┘
```

---

## Technologies utilisées

| Technologie | Rôle | Version |
|-------------|------|---------|
| **Next.js** | Framework Frontend (App Router) | 16.x |
| **TypeScript** | Langage principale | 5.x |
| **Tailwind CSS** | Styles et design responsive | 4.x |
| **Capacitor** | Conversion en application Android native | 6.x |
| **React** | Bibliothèque UI | 19.x |

---

## Structure du projet

```
protecteurautomatique/
├── public/
│   ├── logo.svg                 # Logo Protecteur (bouclier africain)
│   └── manifest.json            # Manifest PWA pour Capacitor
├── src/
│   ├── app/                     # Pages (App Router)
│   │   ├── layout.tsx           # Layout racine (metadata, viewport)
│   │   ├── globals.css          # Palette de couleurs + animations
│   │   ├── page.tsx             # Dashboard principal
│   │   ├── splash/
│   │   │   └── page.tsx         # Splash screen avec logo animé
│   │   ├── inscription/
│   │   │   └── page.tsx         # Formulaire d'inscription
│   │   ├── connexion/
│   │   │   └── page.tsx         # Formulaire de connexion
│   │   ├── setup/
│   │   │   └── page.tsx         # Wizard de configuration (3 étapes)
│   │   ├── notifications/
│   │   │   └── page.tsx         # Paramètres et liste d'alertes
│   │   ├── sms/
│   │   │   └── page.tsx         # Configuration SMS
│   │   ├── historique/
│   │   │   └── page.tsx         # Historique complet avec filtres
│   │   ├── parametres/
│   │   │   └── page.tsx         # Profil, déconnexion, à propos
│   │   └── not-found.tsx        # Page 404 personnalisée
│   ├── components/
│   │   ├── ui/                  # Composants réutilisables
│   │   │   ├── Bouton.tsx       # Bouton stylisé (3 variantes)
│   │   │   ├── Switch.tsx       # Toggle on/off
│   │   │   ├── Carte.tsx        # Carte conteneur
│   │   │   ├── Header.tsx       # En-tête avec logo + statut
│   │   │   └── Navigation.tsx   # Barre de navigation bas
│   │   ├── dashboard/
│   │   │   ├── Semaphore.tsx    # Indicateur visuel vert/orange/rouge
│   │   │   └── CarteCapteur.tsx # Carte individuelle par capteur
│   │   └── notifications/
│   │       └── (composants d'alerte)
│   ├── lib/
│   │   ├── mock-data.ts         # Données fictives capteurs/alertes
│   │   └── store.ts             # Utilitaires localStorage
│   └── types/
│       └── index.ts             # Types TypeScript du projet
├── android/                     # Projet Android généré par Capacitor
├── capacitor.config.ts          # Configuration Capacitor
├── next.config.ts               # Configuration Next.js (export statique)
├── tailwind.config.ts           # Configuration Tailwind
├── package.json                 # Dépendances et scripts
└── tsconfig.json                # Configuration TypeScript
```

---

## Installation et démarrage

### Prérequis

- **Node.js** ≥ 20.x
- **npm** ≥ 10.x
- **Android Studio** (pour le déploiement Capacitor)

### Installation des dépendances

```bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/protecteurautomatique.git
cd protecteurautomatique

# Installer les dépendances
npm install
```

### Lancer en développement

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`.

### Build de production

```bash
npm run build
```

Génère une version statique dans le dossier `out/`.

### Lancer le serveur de production

```bash
npm start
```

---

## Fonctionnalités

### Splash Screen
- Logo Protecteur animé (effet de rebond CSS)
- Redirection automatique selon l'état de l'utilisateur
- Durée : 2,5 secondes

### Inscription / Connexion
- Formulaire email + mot de passe
- Validation côté client (champs requis, format email, longueur MDP)
- Persistance des données en localStorage
- Redirection automatique après la première inscription

### Setup Wizard (3 étapes)
1. **Domicile** : Nom et adresse du lieu à sécuriser
2. **SMS** : Numéro de téléphone pour les alertes par SMS
3. **Notifications** : Activation des notifications push

### Dashboard
- **Sémaphore visuel** : Indicateur global vert/orange/rouge qui pulse
- **État du système** : Bandeau indiquant la connexion à la gateway
- **Cartes capteurs** : 3 cartes (DHT22, PIR, Flamme) avec valeurs en temps réel
- **Alertes récentes** : Les dernières alertes non lues
- Simulation de variation de température toutes les 5 secondes

### Notifications
- Paramètres push avec switchs individuels par type d'alerte
- Liste des alertes récentes avec niveau de sévérité
- Bouton "Tester une notification" (mode mock)
- Marquer toutes les alertes comme lues

### SMS
- Activation/désactivation des SMS
- Configuration du numéro de téléphone
- Choix des types d'alertes déclenchant un SMS
- Bouton "Envoyer un SMS de test" (mode mock)

### Historique
- Liste chronologique de tous les événements
- Filtres par type (intrusion, température, flamme)
- Filtres par niveau (info, attention, danger)
- Badge coloré pour chaque niveau de sévérité

### Paramètres
- Affichage du profil utilisateur
- Bouton déconnexion
- Bouton réinitialisation (efface toutes les données locales)
- Section à propos avec description du système

### Page 404
- Design personnalisé "Zone non sécurisée"
- Illustration bouclier barré
- Bouton retour au dashboard

---

## Écrans de l'application

| Ordre | Écran | Description |
|-------|-------|-------------|
| 1 | Splash | Logo animé + chargement |
| 2 | Inscription | Création de compte |
| 3 | Setup | Configuration en 3 étapes |
| 4 | Dashboard | Vue d'ensemble des capteurs |
| 5 | Notifications | Alertes et paramètres push |
| 6 | SMS | Configuration SMS |
| 7 | Historique | Liste complète avec filtres |
| 8 | Paramètres | Profil et réglages |
| 9 | 404 | Page d'erreur stylée |

---

## Données et mocks

Toutes les données sont actuellement simulées via `src/lib/mock-data.ts`. Ce fichier contient :

- **3 capteurs** : Température (DHT22), Intrusion (PIR), Flamme (YG1006)
- **8 événements d'historique** : Variés (info, warning, danger)
- **2 alertes récentes** : Pour le dashboard
- **Paramètres par défaut** : Notifications et SMS

Les données mockées sont conçues pour être remplacées par de vraies données provenant du backend REST.

---

## Intégration avec le backend

L'application est prête à recevoir de vraies données. Pour connecter le backend :

1. **Remplacer les mocks** dans `src/lib/mock-data.ts` par des appels API
2. **Créer un service API** dans `src/lib/api.ts` pour les requêtes REST
3. **Brancher le polling** dans le Dashboard (remplacer `setInterval` par des appels API)
4. **Configurer l'authentification** JWT dans les headers des requêtes
5. **Activer les notifications push** via l'API Capacitor Push Notifications

### Endpoints attendus

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/capteurs` | GET | Récupérer l'état de tous les capteurs |
| `/api/alertes` | GET | Récupérer la liste des alertes |
| `/api/historique` | GET | Récupérer l'historique des événements |
| `/api/notifications/config` | GET/PUT | Lire/modifier les paramètres de notification |
| `/api/sms/config` | GET/PUT | Lire/modifier les paramètres SMS |
| `/api/auth/connexion` | POST | Authentifier l'utilisateur |
| `/api/auth/inscription` | POST | Créer un compte |

---

## Déploiement Android (Capacitor)

### Prérequis

- **Android Studio** installé
- **SDK Android** ≥ API 22

### Étapes

```bash
# 1. Build de la version statique
npm run build

# 2. Synchroniser les assets avec le projet Android
npm run cap:sync

# 3. Ouvrir dans Android Studio
npm run cap:open
```

### Dans Android Studio

1. Attendre que Gradle synchronise le projet
2. Sélectionner un appareil ou émulateur
3. Cliquer sur **Run** (▶️)
4. L'app s'installe sur l'appareil Android

### Icône de l'application

L'icône est définie dans `public/logo.svg`. Pour personnaliser les icônes Android, modifier les fichiers dans `android/app/src/main/res/`.

---

## Palette de couleurs

La palette est inspirée des tons de terre et de nature, dans un style sobre et authentique.

| Nom | Couleur | Code | Usage |
|-----|---------|------|-------|
| Sable | Crème chaud | `#F5F0E8` | Fond principal |
| Terre | Brun moyen | `#8B5E3C` | En-tête, boutons, accent |
| Terre foncé | Brun profond | `#6D4A2E` | Hover boutons |
| Brun | Brun sombre | `#3D2B1F` | Texte principal |
| Vert sahel | Vert nature | `#6B8E4E` | Sécurité OK, vert |
| Orange ocre | Orange terre | `#D4883A` | Alerte moyenne |
| Rouge brique | Rouge doux | `#C0392B` | Danger, erreurs |
| Bleu nuit | Bleu foncé | `#2C3E50` | Éléments secondaires |
| Bordure | Beige | `#E8DDD0` | Bordures et séparateurs |
| Sable foncé | Beige foncé | `#D4C4B0` | Texte secondaire, placeholders |

---

## Convention de code

### Style

- **Clean Code** : code lisible et maintenable
- **Simplicité** : pas d'usines à gaz, privilégier la solution la plus simple
- **Mobile-first** : tous les composants sont optimisés pour les écrans de smartphone
- **Commentaires en français** : expliquer le "pourquoi" et non le "comment"

### Nommage des fichiers

- **Pages** : `page.tsx` dans des dossiers nommés (ex: `src/app/dashboard/page.tsx`)
- **Composants** : PascalCase (ex: `CarteCapteur.tsx`)
- **Utilitaires** : camelCase (ex: `mock-data.ts`)
- **Types** : PascalCase dans `src/types/index.ts`

### State management

- **localStorage** pour la persistance locale (pas de Redux/Zustand pour l'instant)
- **useState** React pour l'état local des composants
- **Pas de contexte global** pour garder la simplicité

---

## État d'avancement

| Module | Statut | Description |
|--------|--------|-------------|
| Splash Screen | Terminé | Logo animé + redirection intelligente |
| Inscription | Terminé | Formulaire complet avec validation |
| Connexion | Terminé | Vérification en local |
| Setup Wizard | Terminé | 3 étapes (domicile, SMS, notifications) |
| Dashboard | Terminé | Sémaphore + 3 cartes + alertes |
| Notifications | Terminé | Paramètres push + liste alertes |
| SMS | Terminé | Configuration + test mock |
| Historique | Terminé | Liste + filtres |
| Paramètres | Terminé | Profil + déconnexion |
| 404 | Terminé | Page personnalisée |
| Backend API | En attente | Mock-driven, prêt à brancher |
| Notifications push | En attente | Interface prête, API à connecter |
| Envoi SMS | En attente | Interface prête, Twilio à connecter |
| Déploiement Android | Configuré | Capacitor prêt, test sur appareil nécessaire |

---

## Contribuer

1. Forker le dépôt
2. Créer une branche (`git checkout -b feature/nom-fonctionnalite`)
3. Commiter les changements (`git commit -m 'Ajouter une fonctionnalité'`)
4. Pusher (`git push origin feature/nom-fonctionnalite`)
5. Ouvrir une Pull Request

---

## Licence

Projet privé — Protecteur Automatique v1.0.0
# protecteurautomatique1
