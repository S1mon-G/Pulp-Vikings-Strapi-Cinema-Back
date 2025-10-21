module.exports = {
    async searchAll(ctx) {
        const { q } = ctx.query;
        if (!q || q.trim() === '') {
            return { data: [] };
        }

        const normalized = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const [movies, actors] = await Promise.all([
            strapi.db.query('api::movie.movie').findMany({
                where: {
                    title: { $containsi: normalized },
                },
                limit: 5,
            }),
            strapi.db.query('api::actor.actor').findMany({
                where: {
                    name: { $containsi: normalized },
                },
                limit: 5,
            }),
        ]);

        return {
            data: [
                ...movies.map((m) => ({ type: 'movie', id: m.documentId, name: m.title })),
                ...actors.map((a) => ({ type: 'actor', id: a.documentId, name: a.name })),
            ],
        };
    },
};
