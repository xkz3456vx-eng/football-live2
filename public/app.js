const API_BASE = '/api';
const loader = (message) => `<div class="card">${message}</div>`;

const leagueSelects = {
  standings: document.getElementById('standings-league'),
  fixtures: document.getElementById('fixture-league')
};

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
  return res.json();
}

function renderSummary(summary) {
  const container = document.getElementById('summary-cards');
  const leaguesCount = summary.leaguesCount?.results || 0;
  const matchesToday = summary.today?.results || 0;
  const topScorer = summary.premierScorers?.response?.[0];
  const cards = [
    { title: 'Ligues suivies', value: leaguesCount, subtitle: 'Type league' },
    { title: 'Matchs du jour', value: matchesToday, subtitle: 'Tous pays' },
    {
      title: 'Top buteur Premier League',
      value: topScorer ? `${topScorer.player.name}` : '–',
      subtitle: topScorer ? `${topScorer.statistics[0].goals.total || 0} buts` : 'En attente'
    }
  ];
  container.innerHTML = cards.map(card => `
    <div class="card">
      <p class="eyebrow">${card.subtitle}</p>
      <h3>${card.title}</h3>
      <p class="value">${card.value}</p>
    </div>
  `).join('');
}

function renderMatches(list, elementId, emptyText = 'Aucun match') {
  const container = document.getElementById(elementId);
  if (!list?.length) {
    container.innerHTML = `<p class="muted">${emptyText}</p>`;
    return;
  }
  container.innerHTML = list.map(item => {
    const fixture = item.fixture;
    const league = item.league;
    const goals = item.goals || {};
    const status = fixture.status?.short || '';
    const time = fixture.date ? new Date(fixture.date).toLocaleString() : '';
    const score = `${goals.home ?? '-'} - ${goals.away ?? '-'}`;
    return `
      <div class="match">
        <div>
          <div class="match__teams">${item.teams.home.name} ${score} ${item.teams.away.name}</div>
          <div class="match__meta">${league.name} • ${league.country} • ${status}</div>
        </div>
        <span class="badge">${time}</span>
      </div>
    `;
  }).join('');
}

function populateLeagueSelects(leagues) {
  Object.values(leagueSelects).forEach(select => select.innerHTML = '');
  Object.values(leagues).forEach(({ id, name, country }) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = `${name} (${country})`;
    leagueSelects.standings.appendChild(option.cloneNode(true));
    leagueSelects.fixtures.appendChild(option);
  });
}

async function loadSummary() {
  const cards = document.getElementById('summary-cards');
  cards.innerHTML = loader('Chargement des chiffres...');
  try {
    const data = await fetchJSON(`${API_BASE}/summary`);
    renderSummary(data);
    const upcoming = await fetchJSON(`${API_BASE}/fixtures/upcoming?league=39&next=5`);
    renderMatches(upcoming.response, 'upcoming-list', 'Pas de matchs bientôt');
  } catch (error) {
    cards.innerHTML = `<p class="muted">Impossible de charger le résumé (${error.message}).</p>`;
  }
}

async function loadStandings(leagueId) {
  const tbody = document.querySelector('#standings-table tbody');
  tbody.innerHTML = '<tr><td colspan="7">Chargement...</td></tr>';
  try {
    const data = await fetchJSON(`${API_BASE}/standings?league=${leagueId}`);
    const table = data.response?.[0]?.league?.standings?.[0] || [];
    tbody.innerHTML = table.map(row => `
      <tr>
        <td>${row.team.name}</td>
        <td>${row.all.played}</td>
        <td>${row.points}</td>
        <td>${row.all.win}</td>
        <td>${row.all.draw}</td>
        <td>${row.all.lose}</td>
        <td>${row.goalsDiff}</td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="7">Erreur de chargement (${error.message})</td></tr>`;
  }
}

async function loadLive(country) {
  const container = document.getElementById('live-matches');
  container.innerHTML = loader('Recherche des matchs en direct...');
  try {
    const query = country ? `?country=${encodeURIComponent(country)}` : '';
    const data = await fetchJSON(`${API_BASE}/live${query}`);
    renderMatches(data.response, 'live-matches', 'Pas de match en cours');
  } catch (error) {
    container.innerHTML = `<p class="muted">Impossible de récupérer les lives (${error.message}).</p>`;
  }
}

async function loadFixtures() {
  const date = document.getElementById('fixture-date').value || new Date().toISOString().slice(0,10);
  const league = leagueSelects.fixtures.value;
  const container = document.getElementById('fixtures-list');
  container.innerHTML = loader('Recherche des matchs...');
  try {
    const data = await fetchJSON(`${API_BASE}/fixtures/by-date?date=${date}&league=${league}`);
    renderMatches(data.response, 'fixtures-list', 'Pas de rencontre');
  } catch (error) {
    container.innerHTML = `<p class="muted">Erreur lors de la recherche (${error.message}).</p>`;
  }
}

async function searchPlayers() {
  const q = document.getElementById('player-query').value.trim();
  const results = document.getElementById('players-results');
  if (!q) {
    results.innerHTML = '<p class="muted">Tape un nom de joueur.</p>';
    return;
  }
  results.innerHTML = loader('Recherche...');
  try {
    const data = await fetchJSON(`${API_BASE}/players/search?q=${encodeURIComponent(q)}`);
    const players = data.response || [];
    if (!players.length) {
      results.innerHTML = '<p class="muted">Aucun joueur trouvé.</p>';
      return;
    }
    results.innerHTML = players.map(({ player, statistics }) => {
      const stats = statistics?.[0] || {};
      const club = stats.team?.name || 'N/A';
      return `
        <div class="player card">
          <div class="tag">${player.nationality || 'N/A'}</div>
          <h3>${player.name}</h3>
          <p>${club}</p>
          <p>Poste: ${player.position || 'N/A'} • Numéro: ${player.number || '–'}</p>
          <p>Buts: ${stats.goals?.total ?? 0} | Passes: ${stats.goals?.assists ?? 0} | Apparitions: ${stats.games?.appearences ?? 0}</p>
        </div>
      `;
    }).join('');
  } catch (error) {
    results.innerHTML = `<p class="muted">Erreur: ${error.message}</p>`;
  }
}

function enableDragAndDrop(poolPlayers) {
  const pool = document.getElementById('player-pool');
  pool.innerHTML = poolPlayers.map(p => `
    <div class="pool__item" draggable="true" data-player='${JSON.stringify(p)}'>
      <span>${p.name}</span>
      <span class="tag">${p.position}</span>
    </div>
  `).join('');

  document.querySelectorAll('.pool__item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', item.dataset.player);
    });
  });

  document.querySelectorAll('.slot').forEach(slot => {
    slot.addEventListener('dragover', (e) => e.preventDefault());
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (!data) return;
      if (slot.classList.contains('filled')) {
        slot.textContent = slot.dataset.position;
        slot.classList.remove('filled');
      }
      slot.textContent = data.name;
      slot.dataset.playerId = data.id;
      slot.dataset.positionRole = data.position;
      slot.classList.add('filled');
    });
  });
}

function saveTeam() {
  const name = document.getElementById('team-name').value || 'Mon Onze';
  const slots = Array.from(document.querySelectorAll('.slot')).map(slot => ({
    seat: slot.dataset.position,
    player: slot.dataset.playerId ? {
      id: slot.dataset.playerId,
      name: slot.textContent,
      position: slot.dataset.positionRole
    } : null
  }));
  const payload = { name, slots };
  localStorage.setItem('custom-team', JSON.stringify(payload));
  alert('Composition sauvegardée !');
}

function loadTeam() {
  const raw = localStorage.getItem('custom-team');
  if (!raw) return alert('Aucune composition sauvegardée.');
  const data = JSON.parse(raw);
  document.getElementById('team-name').value = data.name;
  document.querySelectorAll('.slot').forEach((slot, idx) => {
    const saved = data.slots[idx];
    if (saved?.player) {
      slot.textContent = saved.player.name;
      slot.dataset.playerId = saved.player.id;
      slot.dataset.positionRole = saved.player.position;
      slot.classList.add('filled');
    } else {
      slot.textContent = slot.dataset.position;
      slot.classList.remove('filled');
    }
  });
}

async function bootstrap() {
  const leagues = await fetchJSON(`${API_BASE}/leagues`);
  populateLeagueSelects(leagues.leagues);
  await loadSummary();
  await loadStandings(leagueSelects.standings.value);
  await loadLive();
  await loadFixtures();
  const poolData = await fetchJSON(`${API_BASE}/players/topscorers?league=39`);
  const players = (poolData.response || []).slice(0, 12).map(item => ({
    id: item.player.id,
    name: item.player.name,
    position: item.statistics?.[0]?.games?.position || 'ATT'
  }));
  enableDragAndDrop(players);

  // rafraîchissement automatique du live
  setInterval(() => {
    const filter = document.getElementById('live-filter').value;
    loadLive(filter);
  }, 60000);
}

// Event bindings
leagueSelects.standings.addEventListener('change', (e) => loadStandings(e.target.value));
leagueSelects.fixtures.addEventListener('change', loadFixtures);
document.getElementById('search-fixtures').addEventListener('click', loadFixtures);
document.getElementById('refresh-live').addEventListener('click', () => loadLive(document.getElementById('live-filter').value));
document.getElementById('live-filter').addEventListener('input', (e) => loadLive(e.target.value));
document.getElementById('search-players').addEventListener('click', searchPlayers);
document.getElementById('refresh-summary').addEventListener('click', loadSummary);
document.getElementById('save-team').addEventListener('click', saveTeam);
document.getElementById('load-team').addEventListener('click', loadTeam);

document.addEventListener('DOMContentLoaded', bootstrap);
