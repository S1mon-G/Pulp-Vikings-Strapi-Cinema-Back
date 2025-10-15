export default {
  routes: [
    {
      method: "POST",
      path: "/actors/enrich-tmdb",
      handler: "actor.enrichActorsFromTMDB",
      config: {
        auth: false, // Pas besoin d'auth pour l'import manuel
      },
    },
  ],
};
