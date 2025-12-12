import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.FOOTBALL_API_KEY;
if (!apiKey) {
  console.warn('Warning: FOOTBALL_API_KEY is not set. Set it in your .env file.');
}

const client = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  headers: {
    'x-rapidapi-key': apiKey || '',
    'x-rapidapi-host': 'v3.football.api-sports.io'
  }
});

const EURO_LEAGUES = {
  premierLeague: { id: 39, name: 'Premier League', country: 'England' },
  laLiga: { id: 140, name: 'La Liga', country: 'Spain' },
  ligue1: { id: 61, name: 'Ligue 1', country: 'France' },
  serieA: { id: 135, name: 'Serie A', country: 'Italy' },
  bundesliga: { id: 78, name: 'Bundesliga', country: 'Germany' }
};

async function getStandings(leagueId, season = new Date().getFullYear()) {
  const response = await client.get('/standings', {
    params: { league: leagueId, season }
  });
  return response.data;
}

async function getLive(country) {
  const params = { live: 'all' };
  if (country) params.country = country;
  const response = await client.get('/fixtures', { params });
  return response.data;
}

async function getUpcoming({ leagueId, next = 10 }) {
  const response = await client.get('/fixtures', {
    params: { league: leagueId, next }
  });
  return response.data;
}

async function getFixturesByDate({ date, leagueId }) {
  const params = { date };
  if (leagueId) params.league = leagueId;
  const response = await client.get('/fixtures', { params });
  return response.data;
}

async function searchPlayers({ query, team, league }) {
  const params = { search: query };
  if (team) params.team = team;
  if (league) params.league = league;
  const response = await client.get('/players', { params });
  return response.data;
}

async function getTopScorers(leagueId, season = new Date().getFullYear()) {
  const response = await client.get('/players/topscorers', {
    params: { league: leagueId, season }
  });
  return response.data;
}

async function getLeaguesCount() {
  const response = await client.get('/leagues', { params: { type: 'league' } });
  return response.data;
}

async function getTodaysFixtures() {
  const today = new Date().toISOString().slice(0, 10);
  const response = await client.get('/fixtures', { params: { date: today } });
  return response.data;
}

export {
  EURO_LEAGUES,
  getStandings,
  getLive,
  getUpcoming,
  getFixturesByDate,
  searchPlayers,
  getTopScorers,
  getLeaguesCount,
  getTodaysFixtures
};
