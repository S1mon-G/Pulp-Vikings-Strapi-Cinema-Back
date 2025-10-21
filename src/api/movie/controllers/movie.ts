/**
 * movie controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::movie.movie",
  ({ strapi }) => ({
    /**
     * Import des films depuis TMDB
     * POST /api/movies/import-tmdb
     * Body: { "page": 1, "type": "popular" | "upcoming" }
     */
    async importFromTMDB(ctx) {
      try {
        const { page = 1, type = "popular" } = ctx.request.body as {
          page?: number;
          type?: "popular" | "upcoming";
        };

        strapi.log.info(`Démarrage import TMDB page ${page} (${type})`);

        const result = await strapi
          .service("api::movie.tmdb-import")
          .importPopularMovies(page, type);

        ctx.body = {
          success: true,
          data: result,
        };
      } catch (error) {
        strapi.log.error("Erreur import TMDB:", error);
        ctx.status = 500;
        ctx.body = {
          success: false,
          error: error.message,
        };
      }
    },
    // Endpoint pour obtenir les films par note (on enlève les films qui sont à vote "null")
    async getByRating(ctx) {
      try {
        const { order = "desc" } = ctx.query;
        const movies = await strapi.db.query("api::movie.movie").findMany({
          where: {
            vote_average: { $ne: null },
          },
          orderBy: { vote_average: order },
          populate: ["actors"],
        });
        ctx.body = {
          success: true,
          data: movies,
        };
      } catch (error) {
        ctx.body = {
          success: false,
          error: error.message,
        };
      }
    },
    // Endpoint pour obtenir des films aléatoires
    async getRandomMovies(ctx) {
      try {
        const allMovies = await strapi.db.query("api::movie.movie").findMany({
          populate: ["actors"],
        });
        const shuffledMovies = allMovies.sort(() => Math.random() - 0.5);
        ctx.body = {
          success: true,
          data: shuffledMovies,
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
