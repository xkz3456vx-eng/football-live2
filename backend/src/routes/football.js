import express from 'express';
import {
  EURO_LEAGUES,
  getStandings,
  getLive,
  getUpcoming,
  getFixturesByDate,
  searchPlayers,
  getTopScorers,
  getLeaguesCount,
  getTodaysFixtures
} from '../services/footballApi.js';

const router = express.Router();

router.get('/leagues', (_req, res) => {
  res.json({ leagues: EURO_LEAGUES });
});

router.get('/standings', async (req, res) => {
  try {
    const { league, season } = req.query;
    if (!league) return res.status(400).json({ error: 'league is required' });
    const data = await getStandings(league, season);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

router.get('/live', async (req, res) => {
  try {
    const { country } = req.query;
    const data = await getLive(country);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

router.get('/fixtures/upcoming', async (req, res) => {
  try {
    const { league, next } = req.query;
    const data = await getUpcoming({ leagueId: league, next });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

router.get('/fixtures/by-date', async (req, res) => {
  try {
    const { date, league } = req.query;
    if (!date) return res.status(400).json({ error: 'date is required YYYY-MM-DD' });
    const data = await getFixturesByDate({ date, leagueId: league });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

router.get('/players/search', async (req, res) => {
  try {
    const { q, team, league } = req.query;
    if (!q) return res.status(400).json({ error: 'q is required' });
    const data = await searchPlayers({ query: q, team, league });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

router.get('/players/topscorers', async (req, res) => {
  try {
    const { league, season } = req.query;
    if (!league) return res.status(400).json({ error: 'league is required' });
    const data = await getTopScorers(league, season);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

router.get('/summary', async (_req, res) => {
  try {
    const [leaguesCount, today, premierScorers] = await Promise.all([
      getLeaguesCount(),
      getTodaysFixtures(),
      getTopScorers(EURO_LEAGUES.premierLeague.id)
    ]);
    res.json({ leaguesCount, today, premierScorers });
  } catch (error) {
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
});

export default router;
