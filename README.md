# Football Live Europe

Application web complète (frontend + backend) pour suivre le football européen (France, Espagne, Allemagne, Angleterre, Italie) en s'appuyant sur l'API Football (type API-FOOTBALL).

## Fonctionnalités principales
- Page d'accueil avec chiffres clés (nombre de ligues, matchs du jour, meilleur buteur) et aperçu des prochains matchs européens.
- Classements temps réel des principales ligues avec sélecteur de championnat.
- Matchs en direct avec filtrage par pays et rafraîchissement manuel.
- Calendrier des matchs par date et ligue.
- Recherche de joueurs (club, poste, statistiques basiques) connectée à l'API.
- Mini-jeu "Créer ton équipe" avec drag & drop, sauvegarde et chargement via localStorage.

## Prérequis
- Node.js 18+
- Une clé API Football (type API-FOOTBALL)

## Installation
1. Installer les dépendances backend :
   ```bash
   cd backend
   npm install
   ```
2. Copier le fichier d'exemple d'environnement et renseigner la clé :
   ```bash
   cp .env.example .env
   # Éditer .env pour définir FOOTBALL_API_KEY=VOTRE_CLE_API
   ```

## Lancer le projet
- **Backend (proxy + serveur statique du frontend)**
  ```bash
  cd backend
  npm run start
  ```
  Par défaut, l'API proxy écoute sur `http://localhost:3001` et sert le fichier `index.html` à la racine ainsi que les assets du dossier `public/`.

- **Frontend**
  La page principale `index.html` est à la racine. Les fichiers statiques (CSS, JS) sont dans `public/`. Ouvrez `http://localhost:3001` après avoir démarré le backend.

## Architecture
```
backend/
  server.js          # Express + CORS + logs + service statique
  src/routes/        # Routes internes qui appellent l'API Football
  src/services/      # Client axios et constantes des ligues européennes
public/
  styles.css         # Design moderne et responsive
  app.js             # Logique UI, appels API, drag & drop, localStorage
index.html           # Structure de la SPA avec sections dédiées à la racine
```

## Notes API
- La clé doit rester côté backend dans la variable d'environnement `FOOTBALL_API_KEY` (ne jamais l'exposer au front).
- Le proxy utilise l'URL `https://v3.football.api-sports.io` avec les en-têtes `x-rapidapi-key` et `x-rapidapi-host`.
- Endpoints utilisés :
  - `/standings` (classements)
  - `/fixtures` (matchs en direct, par date, prochains)
  - `/players` (recherche)
  - `/players/topscorers` (buteurs)
  - `/leagues` (statistiques globales)

## Validation et erreurs
- Les routes vérifient les paramètres obligatoires et renvoient des erreurs claires (`400` pour paramètres manquants, `500` en cas d'échec API).
- Le frontend affiche des états de chargement, des messages d'absence de données et gère la persistance locale du mini-jeu.

## Personnalisation
- Le fichier `public/styles.css` contient la palette et les espacements pour ajuster rapidement le thème.
- Les IDs de ligues européennes sont centralisés dans `backend/src/services/footballApi.js` (Premier League 39, La Liga 140, Ligue 1 61, Serie A 135, Bundesliga 78).
