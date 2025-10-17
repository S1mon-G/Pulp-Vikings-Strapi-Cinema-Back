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
  ],
};
