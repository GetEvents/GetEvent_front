# GetEvent Frontend

GetEvent est une plateforme web de gestion et de billetterie d'evenements. Cette partie du projet correspond au frontend Next.js. Elle fournit l'interface utilisateur permettant de consulter des evenements, creer un compte, se connecter, gerer son profil, creer des evenements, participer, payer des billets, consulter ses QR codes, utiliser la messagerie et recevoir des notifications.

## Objectifs

- Proposer une interface claire pour les participants et les organisateurs.
- Permettre la consultation, la creation et la gestion d'evenements.
- Integrer les parcours d'authentification, de paiement et de billetterie.
- Consommer l'API backend GetEvent via des services et actions frontend.
- Preparer la qualite du code avec ESLint, Storybook, Vitest et les bonnes pratiques d'accessibilite.

## Stack technique

- Next.js avec App Router
- React
- TypeScript et JavaScript
- SCSS modules et CSS global
- React Query
- Socket.IO client
- Storybook
- Vitest
- Playwright pour les tests navigateur via Vitest
- ESLint, Prettier, Husky et lint-staged

## Prerequis

- Node.js 20 ou version compatible avec Next.js
- npm
- Backend GetEvent lance et accessible
- Variables d'environnement configurees dans `.env.local`

## Installation

Depuis le dossier `GetEvent_front` :

```bash
npm ci
```

Si `npm ci` echoue parce que le fichier `package-lock.json` n'est pas synchronise avec `package.json`, utiliser temporairement :

```bash
npm install
```

## Configuration

Creer un fichier `.env.local` a partir des variables attendues. Ne jamais commiter ce fichier.

Exemple :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_ENDPOINT=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_public_key
NEXT_PUBLIC_GOOGLE_MAP_ID=your_google_map_id
API_INTERNAL_URL=http://localhost:3001
```

`NEXT_PUBLIC_GOOGLE_MAP_ID` active les marqueurs avancés Google Maps. En l'absence de valeur locale, l'application utilise `DEMO_MAP_ID`; un Map ID propre au projet doit être configuré en production.

Important : seules les variables qui commencent par `NEXT_PUBLIC_` sont exposees au navigateur. Aucune cle secrete privee ne doit etre placee dans une variable `NEXT_PUBLIC_*`.

## Lancement en developpement

```bash
npm run dev
```

L'application est ensuite disponible par defaut sur :

```text
http://localhost:3000
```

## Scripts disponibles

```bash
npm run dev
```

Lance le serveur de developpement Next.js.

```bash
npm run build
```

Compile l'application pour la production.

```bash
npm run start
```

Lance l'application compilee en mode production.

```bash
npm run lint
```

Execute ESLint sur le projet.

```bash
npm run storybook
```

Lance Storybook sur le port `6006`.

```bash
npm run build-storybook
```

Genere la version statique de Storybook.

## Tests

Le projet contient une configuration Vitest/Storybook dans `vitest.config.ts`, avec Playwright pour les tests navigateur.

Scripts disponibles :

```bash
npm test
npm run test:watch
npm run test:coverage
```

`npm test` exécute les tests unitaires du projet Vitest. Le mode surveillance et le rapport de couverture sont accessibles avec les deux autres commandes.

Composants et parcours prioritaires à maintenir sous test :

- `LoginForm`
- `RegisterForm`
- `EventForm`
- `EventCart`
- `TicketQRCode`
- `TicketQRCodeLecteur`
- `NotificationModal`
- `Dashboard`

## Structure du projet

```text
GetEvent_front/
|-- .storybook/              # Configuration Storybook pour isoler, documenter et tester les composants UI
|-- public/                  # Images, icones et fichiers statiques accessibles cote client
|-- src/
|   |-- app/                 # Routage Next.js avec App Router : pages, layouts et routes applicatives
|   |-- actions/             # Actions metier frontend : auth, evenements, paiements, notifications
|   |-- components/          # Composants d'interface reutilisables : formulaires, cartes, navbar, dashboard
|   |-- constext/            # Contexte React d'authentification et provider global
|   |-- hooks/               # Hooks React personnalises : auth, evenements, participants, paiements
|   |-- lib/                 # Fonctions utilitaires partagees et client API
|   |-- services/            # Services d'appel a l'API backend
|   |-- styles/              # Variables CSS et styles globaux
|   |-- types/               # Types TypeScript globaux
|   `-- utils/               # Fonctions utilitaires : Google Maps, autocomplete, chargement de scripts
|-- eslint.config.mjs        # Configuration ESLint
|-- next.config.mjs          # Configuration Next.js
|-- package.json             # Scripts npm, dependances et metadonnees du frontend
|-- postcss.config.mjs       # Configuration PostCSS
|-- tsconfig.json            # Configuration TypeScript
|-- vitest.config.ts         # Configuration Vitest/Storybook pour les tests frontend
`-- README.md                # Documentation du frontend
```

## Fonctionnalites principales

- Page d'accueil et presentation de la plateforme
- Liste des evenements
- Detail d'un evenement
- Creation d'evenement
- Modification et suppression d'evenement
- Inscription et connexion utilisateur
- Connexion Google OAuth via le backend
- Recuperation et modification du mot de passe
- Profil utilisateur
- Dashboard organisateur
- Gestion des participants
- Participation a un evenement
- Paiement et retour de paiement
- Billets et QR codes
- Scan de billet
- Messagerie evenement
- Notifications
- Pages legales

## Accessibilite

Le projet contient plusieurs elements d'accessibilite deja integres :

- `aria-label` sur des boutons et zones interactives
- `role="dialog"` pour certaines modales
- `role="alert"` et `role="status"` pour les messages utilisateur
- textes alternatifs sur plusieurs images
- labels de formulaires
- addon `@storybook/addon-a11y` configure

Points a finaliser :

- ajouter des tests d'accessibilite bloquants en CI ;
- verifier la navigation clavier sur tous les parcours critiques ;
- produire un rapport RGAA ou OPQUAST ;
- corriger les eventuels contrastes insuffisants.

## Securite cote frontend

Le frontend applique les principes suivants :

- utilisation de variables d'environnement pour les URLs de services ;
- cookies configures avec `secure` en production lorsque le code le prevoit ;
- separation entre logique UI, actions, hooks et services API ;
- non-exposition attendue des secrets prives cote navigateur.

Points de vigilance :

- ne jamais placer de secret prive dans `.env.local` ;
- ne jamais utiliser une cle serveur dans une variable `NEXT_PUBLIC_*` ;
- supprimer les fichiers `.env.local` du dossier livre ;
- fournir un fichier `.env.example` sans valeur sensible.

## Build production

```bash
npm run build
npm run start
```

Avant un deploiement, verifier au minimum :

```bash
npm run lint
npm run build
```

## CI/CD du frontend

Le frontend contient deux workflows GitHub Actions dans `.github/workflows/`.

### Intégration continue

Le workflow `ci.yml` s'exécute lors d'un push sur `develop` ou d'une pull request vers `develop`. Il :

1. Recuperer le code avec `actions/checkout`.
2. Installer Node.js 20.
3. Installer les dependances avec `npm ci`.
4. Installe Chromium pour les tests Playwright.
5. Execute `npm run lint` et `npm test`.
6. Execute `npm run build` et `npm run build-storybook`.
7. Construit une image Docker de contrôle.

### Déploiement continu

Le workflow `deploy.yml` s'exécute lors d'un push sur `main` ou manuellement. Il valide le lint et le build Next.js, puis déclenche le déploiement de production Netlify avec le secret `NETLIFY_BUILD_HOOK_URL`.

## Auteur

Projet developpe par TINGOUGOUI Migbedon Marcelin dans le cadre d'un projet de validation de competences en developpement web.
