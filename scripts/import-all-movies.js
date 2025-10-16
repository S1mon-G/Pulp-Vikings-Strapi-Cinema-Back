const STRAPI_URL = "http://localhost:1337";

// Récupère les arguments de la ligne de commande
const args = process.argv.slice(2);
const MAX_PAGES = parseInt(args[0]) || 20;
const TYPE = args[1] || "popular";

async function importAllMovies() {
  console.log(`🎬 Import de ${MAX_PAGES} pages (${TYPE})...\n`);

  let totalImported = 0;
  let totalActorsCreated = 0;
  let totalActorsReused = 0;

  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const response = await fetch(`${STRAPI_URL}/api/movies/import-tmdb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, type: TYPE }),
      });

      if (!response.ok) {
        console.error(`❌ Page ${page} : Erreur HTTP ${response.status}`);
        continue;
      }

      const result = await response.json();
      const data = result.data;

      totalImported += data.imported;
      totalActorsCreated += data.actorsCreated;
      totalActorsReused += data.actorsReused;

      console.log(`✅ Page ${page}/${MAX_PAGES} : ${data.imported} films`);

      // Pause entre chaque page
      if (page < MAX_PAGES) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error(`❌ Page ${page} : ${error.message}`);
    }
  }

  console.log(
    `\n🎉 Terminé : ${totalImported} films, ${totalActorsCreated} acteurs créés`
  );
}

importAllMovies().catch((error) => {
  console.error("💥 Erreur fatale:", error);
  process.exit(1);
});
