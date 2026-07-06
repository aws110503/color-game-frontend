# Color Game — Frontend (Angular)

Interface Angular pour l'application Color Game : connexion, inscription, jeu de grille de couleurs, historique personnel, et espace d'administration.

Backend associé (API + base de données + instructions complètes) : [color-game-backend](https://github.com/aws110503/color-game-backend)

## Prérequis

- Node.js 20+ et npm
- Angular CLI (`npm install -g @angular/cli`)
- Le backend doit être lancé au préalable sur `http://localhost:8080` (voir le [dépôt backend](https://github.com/aws110503/color-game-backend) pour les instructions de configuration de la base de données et du serveur)

## Installation et lancement

```bash
npm install
ng serve
```

L'application est accessible sur `http://localhost:4200`.

## Structure des routes

| Route | Composant | Accès |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/game` | ColorGame | Authentifié (USER/ADMIN) |
| `/history` | History | Authentifié (USER/ADMIN) |
| `/admin` | Admin | ADMIN uniquement |

## Fonctionnement de l'authentification

Le token JWT retourné par le backend est stocké dans le `localStorage` du navigateur. Un `HttpInterceptor` (`jwt-interceptor.ts`) l'attache automatiquement à chaque requête HTTP sortante via le header `Authorization: Bearer <token>`.

Deux guards protègent les routes :
- `auth-guard.ts` → redirige vers `/login` si aucun token n'est présent
- `admin-guard.ts` → redirige vers `/login` si l'utilisateur n'a pas le rôle ADMIN