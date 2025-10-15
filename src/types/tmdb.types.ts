/**
 * Types TypeScript pour l'API TMDB (The Movie Database)
 * Documentation API: https://developers.themoviedb.org/3
 */

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  original_language: string;
  original_title: string;
}

export interface TMDBMoviesResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  cast_id: number;
  character: string;
  credit_id: string;
  gender: number;
  order: number;
  profile_path: string | null;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  credit_id: string;
  gender: number;
  profile_path: string | null;
}

export interface TMDBCredits {
  id: number;
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBMovieWithCredits extends TMDBMovie {
  credits: TMDBCredits;
}

export interface TMDBPerson {
  id: number;
  name: string;
  birthday: string | null;
  deathday: string | null;
  profile_path: string | null;
  biography: string;
  place_of_birth: string | null;
  popularity: number;
  known_for_department: string;
  gender: number;
  adult: boolean;
  also_known_as: string[];
  homepage: string | null;
  imdb_id: string | null;
}

export interface TMDBPersonSearchResult {
  id: number;
  name: string;
  profile_path: string | null;
  popularity: number;
  known_for_department: string;
}

export interface TMDBPersonSearchResponse {
  page: number;
  results: TMDBPersonSearchResult[];
  total_pages: number;
  total_results: number;
}
