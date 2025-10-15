/**
 * Routes custom pour l'import TMDB
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/movies/import-tmdb",
      handler: "movie.importFromTMDB",
      config: {
        policies: [],
        middlewares: [],
        auth: false, // ⭐ Désactiver l'authentification pour cet endpoint
      },
    },
  ],
};
