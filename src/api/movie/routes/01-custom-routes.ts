export default {
  routes: [
    {
      method: "POST",
      path: "/movies/import-tmdb",
      handler: "movie.importFromTMDB",
      config: {
        auth: { scope: [] },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/movies/by-rating",
      handler: "movie.getByRating",
      config: {
        auth: { scope: [] },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/movies/random-list",
      handler: "movie.getRandomMovies",
      config: {
        auth: { scope: [] },
        policies: [],
        middlewares: [],
      },
    },
  ],
};
