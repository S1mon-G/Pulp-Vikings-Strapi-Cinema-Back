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
    {
      method: "GET",
      path: "/movies/by-rating",
      handler: "movie.getByRating",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/movies/random-list",
      handler: "movie.getRandomMovies",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
  ],
};
