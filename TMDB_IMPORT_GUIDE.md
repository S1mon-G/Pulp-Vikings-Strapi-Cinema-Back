# Guide d'utilisation - Import TMDB

Ce guide explique comment utiliser les fonctionnalités d'import de films et d'enrichissement d'acteurs depuis l'API TMDB.

---

## Prérequis

1. **Clé API TMDB** configurée dans `.env` :

```env
TMDB_API_KEY=votre_cle_api_ici
```

2. **Strapi en cours d'exécution** :

```bash
npm run dev
```

---

## Méthodes d'utilisation

### 🚀 Méthode recommandée : Scripts d'automatisation

Les scripts permettent d'importer massivement des films et d'enrichir tous les acteurs automatiquement.

#### Import massif de films

**Fichier :** `scripts/import-all-movies.js`

**Importer 20 pages (400 films) :**

```bash
node scripts/import-all-movies.js
```

**Importer 50 pages (1000 films) :**

```bash
node scripts/import-all-movies.js 50
```

**Importer 10 pages de films "upcoming" :**

```bash
node scripts/import-all-movies.js 10 upcoming
```

**Ce que ça fait :**

- Boucle automatiquement sur toutes les pages demandées
- Pause de 1 seconde entre chaque page
- Affiche un résumé à la fin (total films, acteurs créés)
- Continue même si une page échoue

---

#### Enrichissement massif des acteurs

**Fichier :** `scripts/enrich-all-actors.js`

**Enrichir tous les acteurs par batch de 50 :**

```bash
node scripts/enrich-all-actors.js
```

**Enrichir par batch de 100 :**

```bash
node scripts/enrich-all-actors.js 100
```

**Enrichir avec max 10 itérations :**

```bash
node scripts/enrich-all-actors.js 50 10
```

**Ce que ça fait :**

- Enrichit automatiquement tous les acteurs sans `birth_date`
- S'arrête quand `remaining = 0`
- Affiche le total à la fin
- Pause de 1 seconde entre chaque batch

---

#### Workflow complet d'import

```bash
# 1. Importer 20 pages de films populaires
node scripts/import-all-movies.js 20

# 2. Enrichir tous les acteurs créés
node scripts/enrich-all-actors.js

# 3. Importer 5 pages de films "upcoming"
node scripts/import-all-movies.js 5 upcoming

# 4. Enrichir les nouveaux acteurs
node scripts/enrich-all-actors.js
```

---

## Méthode 1 : Via HTTP (Postman, Thunder Client, cURL)

### 🎬 Importer des films populaires (page 1)

**Endpoint :** `POST http://localhost:1337/api/movies/import-tmdb`

**Body (JSON) :**

```json
{
  "page": 1,
  "type": "popular"
}
```

**Réponse attendue :**

```json
{
  "success": true,
  "data": {
    "success": true,
    "page": 1,
    "totalPages": 500,
    "imported": 20,
    "actorsCreated": 150,
    "actorsReused": 0,
    "message": "Page 1/500 : 20 films importés, 150 acteurs créés, 0 acteurs réutilisés"
  }
}
```

### 🎬 Importer des films à venir (upcoming)

**Body (JSON) :**

```json
{
  "page": 1,
  "type": "upcoming"
}
```

### 🎬 Importer page 2, 3, etc.

**Popular page 2 :**

```json
{
  "page": 2,
  "type": "popular"
}
```

**Upcoming page 1, 2 :**

```json
{ "page": 1, "type": "upcoming" }
{ "page": 2, "type": "upcoming" }
```

**Note :** Si tu omets `"type"`, par défaut ce sera `"popular"` :

```json
{ "page": 1 }
```

---

### 🎭 Enrichir les acteurs

**Endpoint :** `POST http://localhost:1337/api/actors/enrich-tmdb`

**Body (JSON) :**

```json
{
  "batchSize": 50
}
```

**Réponse attendue :**

```json
{
  "success": true,
  "data": {
    "success": true,
    "enriched": 50,
    "failed": 0,
    "remaining": 100,
    "message": "50 acteurs enrichis, 0 échecs, 100 restants"
  }
}
```

---

## Méthode 2 : Via cURL (Terminal)

### Importer films populaires (page 1)

```bash
curl -X POST http://localhost:1337/api/movies/import-tmdb \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "type": "popular"}'
```

### Importer films à venir (page 1)

```bash
curl -X POST http://localhost:1337/api/movies/import-tmdb \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "type": "upcoming"}'
```

### Enrichir acteurs

```bash
curl -X POST http://localhost:1337/api/actors/enrich-tmdb \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 50}'
```

---

## Méthode 3 : Via Strapi Console (Développeurs)

Dans un terminal séparé (Strapi doit tourner) :

```bash
npm run strapi console
```

Puis dans la console Node :

```javascript
// Importer films populaires page 1
await strapi
  .service("api::movie.tmdb-import")
  .importPopularMovies(1, "popular");

// Importer films à venir page 1
await strapi
  .service("api::movie.tmdb-import")
  .importPopularMovies(1, "upcoming");

// Enrichir 50 acteurs
await strapi.service("api::actor.tmdb-import").enrichActors(50);
```

---

## Vérification et monitoring

### Voir les films importés

`GET http://localhost:1337/api/movies?populate=actors`

### Voir les acteurs

`GET http://localhost:1337/api/actors`

### Admin Strapi

`http://localhost:1337/admin` → Content Manager → Movies / Actors

---

## Exemple d'utilisation complète

1. **Importer popular page 1** (20 films populaires, ~150 acteurs)
2. **Vérifier dans Admin** → Content Manager → Movies
3. **Enrichir 50 acteurs** (ajouter birth_date et img)
4. **Vérifier acteurs enrichis** → Content Manager → Actors
5. **Importer upcoming page 1** (20 films à venir, réutilise acteurs existants)
6. **Importer popular page 2** (20 films supplémentaires)
7. **Enrichir les restants** jusqu'à remaining = 0

---

## Logs de l'application

Dans le terminal Strapi, tu verras :

```
📥 Import page 1 de films (popular)...
✅ "Inception" importé (note: 8.8, 10 acteurs)
✅ "The Dark Knight" importé (note: 9.0, 10 acteurs)
...

📥 Import page 1 de films (upcoming)...
✅ "Dune: Part Three" importé (note: 0, 8 acteurs)
...

🎭 Enrichissement des acteurs (batch de 50)...
📋 50 acteurs à enrichir trouvés
✅ "Leonardo DiCaprio" enrichi (né le 1974-11-11)
...
```

---

## Résolution de problèmes

### Erreur "TMDB_API_KEY is not defined"

→ Ajoute `TMDB_API_KEY=ta_cle` dans `.env` et redémarre Strapi

### Erreur 401 TMDB

→ Vérifie que ta clé API est valide sur https://www.themoviedb.org/settings/api

### Films déjà importés

→ Normal, le code skip les doublons (vérifie par tmdb_id)

### Timeout

→ Normal si beaucoup de films, augmente le timeout ou réduit le nombre d'acteurs par film (ligne `.slice(0, 10)`)
