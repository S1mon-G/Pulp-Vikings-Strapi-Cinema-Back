const STRAPI_URL = "http://localhost:1337";

// Récupère les arguments de la ligne de commande
const args = process.argv.slice(2);
const BATCH_SIZE = parseInt(args[0]) || 50; // Nombre d'acteurs par batch (défaut: 50)
const MAX_ITERATIONS = parseInt(args[1]) || 999; // Sécurité max iterations (défaut: illimité)

async function enrichAllActors() {
  console.log(
    `🎭 Enrichissement de tous les acteurs (batch: ${BATCH_SIZE})...\n`
  );

  let iteration = 0;
  let totalEnriched = 0;
  let totalFailed = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    try {
      const response = await fetch(`${STRAPI_URL}/api/actors/enrich-tmdb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchSize: BATCH_SIZE }),
      });

      if (!response.ok) {
        console.error(`❌ Erreur HTTP ${response.status}`);
        break;
      }

      const result = await response.json();
      const data = result.data; // Extraire le data de la réponse

      totalEnriched += data.enriched;
      totalFailed += data.failed;

      console.log(
        `✅ Batch ${iteration} : ${data.enriched} enrichis, ${data.remaining} restants`
      );

      // Si plus aucun acteur à enrichir, on arrête
      if (data.remaining === 0) {
        console.log(
          `\n🎉 Terminé : ${totalEnriched} acteurs enrichis, ${totalFailed} échecs`
        );
        break;
      }

      // Pause entre chaque batch
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Erreur batch ${iteration} : ${error.message}`);
      break;
    }
  }
}

enrichAllActors().catch((error) => {
  console.error("💥 Erreur fatale:", error);
  process.exit(1);
});
