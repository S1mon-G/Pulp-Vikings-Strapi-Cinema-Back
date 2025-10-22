import type { TMDBPerson } from "../../../types/tmdb.types";

// Service TMDB pour les acteurs
// Gère l'enrichissement des données acteurs depuis TMDB

module.exports = {
  // PHASE 2 : Enrichissement des acteurs avec leurs fiches complètes

  async enrichActors(batchSize = 50) {
    const apiKey = process.env.TMDB_API_KEY;
    const baseUrl = "https://api.themoviedb.org/3";
    const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

    console.log(`🎭 Enrichissement des acteurs (batch de ${batchSize})...`);

    // 1. On check tous les acteurs qui ont des valeurs birth_date à null mais qui ont bien un tmdb_id

    const actors = await strapi.db.query("api::actor.actor").findMany({
      where: {
        $or: [{ birth_date: null }, { biography: null }],
        tmdb_id: { $ne: null },
      },
      limit: batchSize,
    });

    console.log(`DEBUG: Acteurs trouvés: ${actors.length}`);

    // Si rien à faire, on compte les restants et on retourne
    if (actors.length === 0) {
      const remaining = await strapi.db.query("api::actor.actor").count({
        where: {
          $or: [{ birth_date: null }, { biography: null }],
          tmdb_id: { $ne: null },
        },
      });

      return {
        success: true,
        enriched: 0,
        failed: 0,
        remaining: remaining,
        message: "Aucun acteur à enrichir pour ce batch",
      };
    }

    console.log(`📋 ${actors.length} acteurs à enrichir trouvés`);

    let enriched = 0;
    let failed = 0;

    for (const actor of actors) {
      // 2. Fetch direct avec tmdb_id
      const personResponse = await fetch(
        `${baseUrl}/person/${actor.tmdb_id}?api_key=${apiKey}&language=fr-FR`
      );

      if (!personResponse.ok) {
        console.error(`❌ Erreur person ${actor.tmdb_id} (${actor.name})`);
        failed++;
        continue;
      }

      const personData = (await personResponse.json()) as TMDBPerson;

      // 3. A garder ou non ca rpossible de gérer ça dynamiquement en front
      const profileImgUrl = personData.profile_path
        ? `${imageBaseUrl}${personData.profile_path}`
        : null;

      // 4. Update l'acteur avec les infos complètes
      // Si pas de birthday, on met "1900-01-01" pour marquer comme "traité mais inconnu"
      await strapi.db.query("api::actor.actor").update({
        where: { id: actor.id },
        data: {
          birth_date: personData.birthday || "1900-01-01",
          img: profileImgUrl,
          biography: personData.biography || "Biographie non disponible.",
          popularity: personData.popularity,
        },
      });

      enriched++;
      console.log(
        `✅ "${actor.name}" enrichi (né le ${personData.birthday || "inconnu"})`
      );

      // Pause pour respecter rate limit
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 5. Compter combien il en reste
    const remaining = await strapi.db.query("api::actor.actor").count({
      where: {
        $or: [{ birth_date: null }, { biography: null }],
        tmdb_id: { $ne: null },
      },
    });

    return {
      success: true,
      enriched: enriched,
      failed: failed,
      remaining: remaining,
      message: `${enriched} acteurs enrichis, ${failed} échecs, ${remaining} restants`,
    };
  },
};
