export default {
  routes: [
    {
      method: "POST",
      path: "/movies/import-tmdb",
      handler: "movie.importFromTMDB",
      config: {
        policies: [],
        middlewares: [],
        auth: false, // désactivé pour tester facilement, PENSER A REACTIVER AVEC JWT !!!!
      },
    },
  ],
};
