import type {
  TMDBMoviesResponse,
  TMDBMovieWithCredits,
} from "../../../types/tmdb.types";

// Donc le but étant de nourrir la DB en un minimum de requête pour éviter le ban API
// de quelques minutes de TMDB pour ça on passe par deux phase :
// 1. Import des films avec les noms et id TMDB d'acteurs (ici)
// 2. Enrichissement des acteurs avec des données supplémentaires (dans dossier api -> actor -> service -> tmdb-import.ts)

module.exports = {
  // PHASE 1 : Import des films avec acteurs principaux

  async importPopularMovies(page = 1, type = "popular") {
    const apiKey = process.env.TMDB_API_KEY;
    const baseUrl = "https://api.themoviedb.org/3";
    const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

    // On prépare le futur cron job avec le upcoming mais de base on nourrit avec popular
    const endpoints = {
      popular: "/movie/popular",
      upcoming: "/movie/upcoming",
    };

    const endpoint = endpoints[type] || endpoints.popular;

    console.log(`📥 Import page ${page} de films (${type})...`);

    // 1. Fetch les IDs des films
    const moviesResponse = await fetch(
      `${baseUrl}${endpoint}?api_key=${apiKey}&language=fr-FR&page=${page}`
    );

    if (!moviesResponse.ok) {
      throw new Error(`Erreur TMDb movies: ${moviesResponse.status}`);
    }

    // Un typage est fait en amont dans un fichier séparé

    const moviesData = (await moviesResponse.json()) as TMDBMoviesResponse;
    const movieIds = moviesData.results.map((m) => m.id);
    const totalPages = moviesData.total_pages;

    // On setup les compteurs pour le rapport

    let importedMovies = 0;
    let createdActors = 0;
    let reusedActors = 0;

    // 2. Pour chaque film, fetch détails + crédits en UNE requête
    for (const movieId of movieIds) {
      //  append_to_response=credits récupère tout en 1 appel (merci chatGPT)
      const fullMovieResponse = await fetch(
        `${baseUrl}/movie/${movieId}?api_key=${apiKey}&language=fr-FR&append_to_response=credits`
      );

      if (!fullMovieResponse.ok) {
        console.error(`❌ Erreur film ${movieId}`);
        continue;
      }

      const movie = (await fullMovieResponse.json()) as TMDBMovieWithCredits;

      // On check si on a pas déjà un doublon via l'id TMDB (valeur sure)
      const existingMovie = await strapi.db.query("api::movie.movie").findOne({
        where: { tmdb_id: movie.id },
      });

      if (existingMovie) {
        console.log(
          `⏭️  Film "${movie.title}" (TMDB ID: ${movie.id}) existe déjà, skip.`
        );
        continue;
      }

      // 3. Comme l'api renvoit pas le réal directement on doit le déduire si on a un job = director
      const directorObj = movie.credits?.crew?.find(
        (person) => person.job === "Director"
      );
      const directorName = directorObj?.name || "Inconnu";

      // 4. Les acteurs eux ont tous une valeur cast donc on récupère tous les cast (max 10 faut pas déconner)
      const actorsList =
        movie.credits?.cast
          ?.filter((person) => person.cast_id !== undefined)
          .slice(0, 10) || [];

      // 5. On récupère leur id pour commencer à les créer dans la DB si besoin
      const actorIds = [];

      for (const actor of actorsList) {
        // On check s'il existe déjà via tmdb_id
        let actorEntry = await strapi.db.query("api::actor.actor").findOne({
          where: { tmdb_id: actor.id },
        });

        if (!actorEntry) {
          actorEntry = await strapi.db.query("api::actor.actor").create({
            data: {
              name: actor.name,
              birth_date: null, // Ce sera pour la phase 2
              img: null, // Pareil
              tmdb_id: actor.id, // Grâce à ça
            },
          });
          createdActors++; // on met à jour
        } else {
          reusedActors++; // le rapport
        }

        actorIds.push(actorEntry.id);
      }

      // 6. A garder ou non mais on peut aussi faire ça dynamiquement en front
      const imgUrl = movie.poster_path
        ? `${imageBaseUrl}${movie.poster_path}`
        : null;

      // 7. Et enfin on créé la fiche film avec les acteurs reliés
      await strapi.db.query("api::movie.movie").create({
        data: {
          title: movie.title,
          description: movie.overview || "",
          release_date: movie.release_date,
          director: directorName,
          img: imgUrl,
          vote_average: movie.vote_average || null,
          tmdb_id: movie.id,
          actors: actorIds,
        },
      });

      importedMovies++;
      console.log(
        `✅ "${movie.title}" importé (note: ${movie.vote_average}, ${actorIds.length} acteurs)`
      );

      // Petite pause pour respecter rate limit TMDB (vive le BAN)
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    return {
      success: true,
      page: page,
      totalPages: totalPages,
      imported: importedMovies,
      actorsCreated: createdActors,
      actorsReused: reusedActors,
      message: `Page ${page}/${totalPages} : ${importedMovies} films importés, ${createdActors} acteurs créés, ${reusedActors} acteurs réutilisés`,
    };
  },
};
