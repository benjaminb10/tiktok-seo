# Admin Dashboard

## Accès Admin

### URL
Accédez au dashboard admin via : **`/admin`**

### Mot de passe
```
benoudis.benjamin@gmail.com!
```

## Fonctionnalités

### 1. Dashboard Admin (`/admin`)
- Vue d'ensemble des fonctionnalités admin
- Liens rapides vers :
  - **Profiles** : Gérer les profils TikTok analysés
  - **Analyses** : Voir l'historique complet des analyses
  - **New Analysis** : Lancer une nouvelle analyse

### 2. Gestion des Profils (`/profiles`)
- Liste de tous les profils TikTok analysés
- Statistiques pour chaque profil :
  - Nombre de vidéos
  - Vues totales
  - Likes totaux
  - Taux d'engagement
- **Suppression de profil** :
  - Bouton corbeille sur chaque profil
  - Demande confirmation + mot de passe admin
  - Supprime le profil et toutes les analyses associées

### 3. Historique des Analyses (`/analyses`)
- Liste de toutes les analyses effectuées
- Filtres et recherche disponibles
- Accès aux détails de chaque analyse

## Système d'Authentification

### Fonctionnement
- **Simple et sécurisé** : Pas de cookies, pas de sessions serveur
- **LocalStorage** : Une fois connecté, votre session est stockée localement dans votre navigateur
- **Protection par mot de passe** : Certaines actions sensibles (suppression) demandent confirmation du mot de passe

### Déconnexion
- Bouton "Logout" dans le dashboard admin
- Vide le localStorage et vous ramène à l'écran de connexion

## Accès Rapide

Un petit point (•) dans le footer du site mène discrètement au dashboard admin.

## Sécurité

- Le mot de passe est vérifié côté serveur via `createServerFn`
- Les actions sensibles nécessitent une re-confirmation du mot de passe
- Session locale uniquement (pas de cookies HTTP)
