export default {
  routes: [
    {
      method: "POST",
      path: "/actors/enrich-tmdb",
      handler: "actor.enrichActorsFromTMDB",
      config: {
        auth: { scope: [] },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/actors/by-rating",
      handler: "actor.getByRating",
      config: {
        auth: { scope: [] },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/actors/random-list",
      handler: "actor.getRandomActors",
      config: {
        auth: { scope: [] },
        policies: [],
        middlewares: [],
      },
    },
  ],
};
