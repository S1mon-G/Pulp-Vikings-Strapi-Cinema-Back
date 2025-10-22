export default {
  routes: [
    {
      method: "POST",
      path: "/actors/enrich-tmdb",
      handler: "actor.enrichActorsFromTMDB",
      config: {
        auth: false, // désactivé pour tester facilement, PENSER A REACTIVER AVEC JWT !!!!
      },
    },
    {
      method: "GET",
      path: "/actors/by-rating",
      handler: "actor.getByRating",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/actors/random-list",
      handler: "actor.getRandomActors",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
  ],
};
