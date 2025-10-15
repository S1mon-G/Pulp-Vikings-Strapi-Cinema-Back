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
  })
);
