# Guide de test - Import TMDB

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

## Méthode 3 : Via Strapi Console (Avancé)

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
await strapi.service("api::movie.tmdb-import").enrichActors(50);
```

---

## Méthode 4 : Script de test rapide

Créer `scripts/test-import.js` :

```javascript
const fetch = require("node-fetch");

async function testImport() {
  // Import popular page 1
  const response = await fetch("http://localhost:1337/api/movies/import-tmdb", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page: 1, type: "popular" }),
  });

  const data = await response.json();
  console.log("Résultat import popular:", data);

  // Import upcoming page 1
  const upcomingResponse = await fetch(
    "http://localhost:1337/api/movies/import-tmdb",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: 1, type: "upcoming" }),
    }
  );

  const upcomingData = await upcomingResponse.json();
  console.log("Résultat import upcoming:", upcomingData);

  // Enrichir acteurs
  const enrichResponse = await fetch(
    "http://localhost:1337/api/actors/enrich-tmdb",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchSize: 50 }),
    }
  );

  const enrichData = await enrichResponse.json();
  console.log("Résultat enrichissement:", enrichData);
}

testImport();
```

Exécuter :

```bash
node scripts/test-import.js
```

---

## Vérification des données

### Voir les films importés

`GET http://localhost:1337/api/movies?populate=actors`

### Voir les acteurs

`GET http://localhost:1337/api/actors`

### Admin Strapi

`http://localhost:1337/admin` → Content Manager → Movies / Actors

---

## Scénario de test complet

1. **Importer popular page 1** (20 films populaires, ~150 acteurs)
2. **Vérifier dans Admin** → Content Manager → Movies
3. **Enrichir 50 acteurs** (ajouter birth_date et img)
4. **Vérifier acteurs enrichis** → Content Manager → Actors
5. **Importer upcoming page 1** (20 films à venir, réutilise acteurs existants)
6. **Importer popular page 2** (20 films supplémentaires)
7. **Enrichir les restants** jusqu'à remaining = 0

---

## Logs à surveiller

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

## 🤖 Préparation Cron Job (automatisation future)

Exemples de stratégies d'automatisation :

### Stratégie 1 : Mise à jour quotidienne upcoming

```javascript
// Tous les jours à 2h du matin
cron.schedule("0 2 * * *", async () => {
  await strapi
    .service("api::movie.tmdb-import")
    .importPopularMovies(1, "upcoming");
});
```

### Stratégie 2 : Mise à jour hebdomadaire popular

```javascript
// Tous les lundis à 3h du matin
cron.schedule("0 3 * * 1", async () => {
  for (let page = 1; page <= 3; page++) {
    await strapi
      .service("api::movie.tmdb-import")
      .importPopularMovies(page, "popular");
    await new Promise((r) => setTimeout(r, 5000)); // 5s entre pages
  }
});
```

### Stratégie 3 : Mix popular + upcoming

```javascript
// Tous les jours à 4h
cron.schedule("0 4 * * *", async () => {
  // Upcoming
  await strapi
    .service("api::movie.tmdb-import")
    .importPopularMovies(1, "upcoming");
  await new Promise((r) => setTimeout(r, 10000));

  // Popular
  await strapi
    .service("api::movie.tmdb-import")
    .importPopularMovies(1, "popular");
});
```

---

## Troubleshooting

### Erreur "TMDB_API_KEY is not defined"

→ Ajoute `TMDB_API_KEY=ta_cle` dans `.env` et redémarre Strapi

### Erreur 401 TMDB

→ Vérifie que ta clé API est valide sur https://www.themoviedb.org/settings/api

### Films déjà importés

→ Normal, le code skip les doublons (vérifie par tmdb_id)

### Timeout

→ Normal si beaucoup de films, augmente le timeout ou réduit le nombre d'acteurs par film (ligne `.slice(0, 10)`)
