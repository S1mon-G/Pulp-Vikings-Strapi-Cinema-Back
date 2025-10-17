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
        birth_date: null,
        tmdb_id: { $ne: null },
      },
      limit: batchSize,
    });

    // Petit return rapide si y'a rien à faire

    if (actors.length === 0) {
      return {
        success: true,
        enriched: 0,
        message: "Tous les acteurs sont déjà enrichis ✨",
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
      await strapi.db.query("api::actor.actor").update({
        where: { id: actor.id },
        data: {
          birth_date: personData.birthday || null,
          img: profileImgUrl,
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
      where: { birth_date: null },
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
