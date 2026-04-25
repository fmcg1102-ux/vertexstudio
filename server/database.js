/**
 * Database: JSON file-based storage for visibility data
 * Tracks daily collection runs and historical trends
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

const dataDir = path.dirname(config.dataFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function ensureDatabase() {
  if (!fs.existsSync(config.dataFile)) {
    const initial = {
      client: config.client,
      lastCollected: null,
      runs: [],
      dailyAggregates: {}
    };
    fs.writeFileSync(config.dataFile, JSON.stringify(initial, null, 2));
  }
}

function readDatabase() {
  ensureDatabase();
  const data = fs.readFileSync(config.dataFile, 'utf8');
  return JSON.parse(data);
}

function writeDatabase(data) {
  ensureDatabase();
  fs.writeFileSync(config.dataFile, JSON.stringify(data, null, 2));
}

function addRun(results) {
  const db = readDatabase();
  const today = new Date().toISOString().split('T')[0];

  // Add to runs
  db.runs.push({
    date: new Date().toISOString(),
    results
  });

  // Keep only last 90 days of raw runs
  if (db.runs.length > 90) {
    db.runs = db.runs.slice(-90);
  }

  // Aggregate for today
  db.dailyAggregates[today] = {
    date: today,
    collected: results.length,
    appeared: results.filter(r => r.appeared).length,
    averagePosition: calculateAvgPosition(results),
    topQueries: results.filter(r => r.appeared),
    competitors: aggregateCompetitors(results)
  };

  db.lastCollected = new Date().toISOString();
  writeDatabase(db);

  return db.dailyAggregates[today];
}

function calculateAvgPosition(results) {
  const positioned = results.filter(r => r.position !== null);
  if (positioned.length === 0) return null;
  const sum = positioned.reduce((acc, r) => acc + r.position, 0);
  return Math.round((sum / positioned.length) * 10) / 10;
}

function aggregateCompetitors(results) {
  const agg = {};
  results.forEach(result => {
    Object.entries(result.allMentions || {}).forEach(([brand, count]) => {
      agg[brand] = (agg[brand] || 0) + count;
    });
  });
  return agg;
}

function getLatestData() {
  const db = readDatabase();
  const dates = Object.keys(db.dailyAggregates).sort().reverse();
  const latestDate = dates[0];
  const latest = latestDate ? db.dailyAggregates[latestDate] : null;

  return {
    client: db.client,
    lastCollected: db.lastCollected,
    latest,
    last30Days: dates.slice(0, 30).map(d => db.dailyAggregates[d]),
    allDates: dates
  };
}

function calculateTrend(days = 30) {
  const db = readDatabase();
  const dates = Object.keys(db.dailyAggregates).sort().reverse();
  const recent = dates.slice(0, days).reverse();

  return {
    labels: recent.map(d => new Date(d).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })),
    scores: recent.map(d => {
      const agg = db.dailyAggregates[d];
      return Math.round((agg.appeared / agg.collected) * 100);
    })
  };
}

module.exports = {
  ensureDatabase,
  readDatabase,
  writeDatabase,
  addRun,
  getLatestData,
  calculateTrend
};
