# 🎬 Pulp Vikings - Cinema API Backend

> Backend API built with Strapi 5 for managing movies and actors data from TMDB (The Movie Database)

[![Strapi Version](https://img.shields.io/badge/Strapi-5.27.0-blue)](https://strapi.io)
[![Node Version](https://img.shields.io/badge/Node-18.x--22.x-green)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-Private-red)]()

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [TMDB Import & Enrichment](#tmdb-import--enrichment)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

---

## 🎯 About

This is the backend API for the **Pulp Vikings Cinema** project - a movie and actor database application. Built with **Strapi 5**, it provides a full REST API to manage movies, actors, and search functionality with data imported from TMDB.

**Key capabilities:**

- Import movies from TMDB (popular, upcoming, top-rated)
- Automatic actor creation and enrichment
- Full-text search across movies and actors
- Rating-based sorting
- Random movie/actor suggestions

---

## ✨ Features

- 🎬 **Movie Management** - Import and manage movie data with ratings, genres, and actors
- 🎭 **Actor Management** - Actor profiles with biography, birth date, and popularity
- 🔍 **Search Engine** - Fast search across movies and actors
- 📊 **Rating Endpoints** - Get movies/actors sorted by popularity
- 🎲 **Random Selection** - Get random movies or actors for discovery
- 🔄 **Batch Import** - Mass import from TMDB with automated scripts
- 🔐 **Authentication Ready** - JWT-based authentication system (configurable)

---

## 🔧 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v18.0.0 - v22.x.x)
- **npm** (v6.0.0 or higher)
- **TMDB API Key** - Get yours at [themoviedb.org](https://www.themoviedb.org/settings/api)

---

## 📦 Installation

1. **Clone the repository**

```bash
git clone https://github.com/S1mon-G/Pulp-Vikings-Strapi-Cinema-Back.git
cd Pulp-Vikings-Strapi-Cinema-Back
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment file**

```bash
cp .env.example .env
```

---

## ⚙️ Configuration

Edit the `.env` file and configure the following variables:

```env
# Server
HOST=0.0.0.0
PORT=1337

# Admin Panel
ADMIN_JWT_SECRET=your-admin-jwt-secret

# API Tokens
API_TOKEN_SALT=your-api-token-salt
TRANSFER_TOKEN_SALT=your-transfer-token-salt

# Encryption
ENCRYPTION_KEY=your-encryption-key

# TMDB API (REQUIRED for imports)
TMDB_API_KEY=your-tmdb-api-key-here

# Database (SQLite by default)
DATABASE_CLIENT=better-sqlite3
DATABASE_FILENAME=.tmp/data.db
```

> **⚠️ Important:** The `TMDB_API_KEY` is required for importing movies and enriching actors!

---

## 🚀 Running the Project

### Development Mode (with auto-reload)

```bash
npm run develop
# or
npm run dev
```

The admin panel will be available at: **http://localhost:1337/admin**

### Production Mode

```bash
npm run build
npm run start
```

### Other Commands

```bash
npm run build        # Build the admin panel
npm run strapi       # Access Strapi CLI
npm run console      # Open Strapi console
```

---

## 🌐 API Endpoints

### Movies

| Method | Endpoint                           | Description                 |
| ------ | ---------------------------------- | --------------------------- |
| `GET`  | `/api/movies`                      | Get all movies              |
| `GET`  | `/api/movies/:id`                  | Get movie by ID             |
| `POST` | `/api/movies/import-tmdb`          | Import movies from TMDB     |
| `GET`  | `/api/movies/by-rating?order=desc` | Get movies sorted by rating |
| `GET`  | `/api/movies/random-list`          | Get random movies           |

### Actors

| Method | Endpoint                           | Description                     |
| ------ | ---------------------------------- | ------------------------------- |
| `GET`  | `/api/actors`                      | Get all actors                  |
| `GET`  | `/api/actors/:id`                  | Get actor by ID                 |
| `POST` | `/api/actors/enrich-tmdb`          | Enrich actors with TMDB data    |
| `GET`  | `/api/actors/by-rating?order=desc` | Get actors sorted by popularity |
| `GET`  | `/api/actors/random-list`          | Get random actors               |

### Search

| Method | Endpoint                          | Description              |
| ------ | --------------------------------- | ------------------------ |
| `GET`  | `/api/search?q=inception&limit=5` | Search movies and actors |

---

## 📥 TMDB Import & Enrichment

### Quick Start

**1. Import 20 pages of popular movies (400 movies)**

```bash
node scripts/import-all-movies.js 20
```

**2. Enrich all actors with biography and birth dates**

```bash
node scripts/enrich-all-actors.js
```

### Import Movies via HTTP

**Request:**

```bash
curl -X POST http://localhost:1337/api/movies/import-tmdb \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "type": "popular"}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "page": 1,
    "totalPages": 500,
    "imported": 20,
    "actorsCreated": 150,
    "actorsReused": 0,
    "message": "Page 1/500 : 20 films importés"
  }
}
```

**Import Types:**

- `popular` - Popular movies
- `upcoming` - Upcoming releases
- `top_rated` - Top rated movies

### Enrich Actors via HTTP

**Request:**

```bash
curl -X POST http://localhost:1337/api/actors/enrich-tmdb \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 50}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "enriched": 50,
    "failed": 0,
    "remaining": 100,
    "message": "50 acteurs enrichis, 0 échecs, 100 restants"
  }
}
```

> 📖 **Detailed guide:** See [TMDB_IMPORT_GUIDE.md](./TMDB_IMPORT_GUIDE.md) for complete documentation

---

## 📁 Project Structure

```
Pulp-Vikings-Strapi-Cinema-Back/
├── config/                  # Configuration files
│   ├── admin.ts            # Admin panel config
│   ├── api.ts              # API config
│   ├── database.ts         # Database config
│   ├── middlewares.ts      # Middlewares
│   ├── plugins.ts          # Plugin config
│   └── server.ts           # Server config
├── database/               # Database migrations
├── public/                 # Public assets
├── scripts/                # Utility scripts
│   ├── import-all-movies.js    # Batch movie import
│   ├── enrich-all-actors.js    # Batch actor enrichment
│   └── seed.js                  # Database seeding
├── src/
│   ├── admin/              # Admin panel customization
│   ├── api/                # API endpoints
│   │   ├── actor/          # Actor content-type
│   │   │   ├── content-types/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   │       └── tmdb-import.ts  # TMDB actor enrichment
│   │   ├── movie/          # Movie content-type
│   │   │   ├── content-types/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   │       └── tmdb-import.ts  # TMDB movie import
│   │   ├── search/         # Search functionality
│   │   └── about/          # About page
│   ├── components/         # Shared components
│   └── types/              # TypeScript types
│       └── tmdb.types.ts   # TMDB API types
└── .env                    # Environment variables
```

---

## 🔨 Scripts

| Script            | Command                                                         | Description                  |
| ----------------- | --------------------------------------------------------------- | ---------------------------- |
| **Import Movies** | `node scripts/import-all-movies.js [pages] [type]`              | Import movies from TMDB      |
| **Enrich Actors** | `node scripts/enrich-all-actors.js [batchSize] [maxIterations]` | Enrich actors with TMDB data |
| **Seed Database** | `npm run seed:example`                                          | Seed with example data       |

### Examples

```bash
# Import 50 pages of popular movies
node scripts/import-all-movies.js 50 popular

# Import 10 pages of upcoming movies
node scripts/import-all-movies.js 10 upcoming

# Enrich actors by batches of 100
node scripts/enrich-all-actors.js 100

# Enrich with max 10 iterations
node scripts/enrich-all-actors.js 50 10
```

---

## 🐛 Troubleshooting

### Port 1337 already in use

```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 1337).OwningProcess | Stop-Process -Force

# Linux/Mac
lsof -ti:1337 | xargs kill -9
```

### TMDB API Errors

- **401 Unauthorized**: Check your `TMDB_API_KEY` in `.env`
- **429 Too Many Requests**: TMDB rate limit reached, wait or reduce batch size
- **404 Not Found**: Movie/Actor not found on TMDB (skipped automatically)

### Database Issues

```bash
# Reset database (⚠️ deletes all data)
rm -rf .tmp/data.db
npm run develop
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Resources

### Strapi Documentation

- [Strapi Documentation](https://docs.strapi.io) - Official documentation
- [Strapi CLI](https://docs.strapi.io/dev-docs/cli) - Command line interface
- [REST API](https://docs.strapi.io/dev-docs/api/rest) - REST API reference

### TMDB API

- [TMDB API Documentation](https://developers.themoviedb.org/3) - Official API docs
- [Get API Key](https://www.themoviedb.org/settings/api) - Register for API access

### Community

- [Strapi Discord](https://discord.strapi.io) - Community support
- [Strapi Forum](https://forum.strapi.io/) - Discussion forum

---

## 👥 Team

**Pulp Vikings** - CDA Brief #1

---

## 📝 License

Private project - All rights reserved

---

## 🙏 Acknowledgments

- TMDB for providing the movie database API
- Strapi team for the amazing headless CMS
- All contributors to this project

---

**Made with ❤️ by the Pulp Vikings team**
