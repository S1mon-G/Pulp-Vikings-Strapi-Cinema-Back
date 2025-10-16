import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::actor.actor",
  ({ strapi }) => ({
    // Endpoint pour enrichir les acteurs depuis TMDB (Phase 2)
    async enrichActorsFromTMDB(ctx) {
      try {
        const { batchSize } = ctx.request.body;

        const result = await strapi
          .service("api::actor.tmdb-import")
          .enrichActors(batchSize);

        return ctx.send(result);
      } catch (error) {
        console.error("❌ Erreur enrichActorsFromTMDB:", error);
        return ctx.badRequest("Erreur lors de l'enrichissement des acteurs");
      }
    },
  })
);
