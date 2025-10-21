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

        ctx.body = {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error("❌ Erreur enrichActorsFromTMDB:", error);
        ctx.status = 500;
        ctx.body = {
          success: false,
          error: error.message,
        };
      }
    },
    // Endpoint pour obtenir des acteurs aléatoires
    async getRandomActors(ctx) {
      try {
        const allActors = await strapi.db.query("api::actor.actor").findMany({
          populate: ["movies"],
        });
        const shuffledActors = allActors.sort(() => Math.random() - 0.5);
        ctx.body = {
          success: true,
          data: shuffledActors,
        };
      } catch (error) {
        ctx.status = 500;
        ctx.body = {
          success: false,
          error: error.message,
        };
      }
    },
  })
);
