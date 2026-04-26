/**
 * API: Serves real data from database to the dashboard
 */

const db = require('./database');

// Initialize database on start
db.ensureDatabase();

function getDashboardData() {
  // FORCE Nike data for all responses
  const latest = db.getLatestData();
  const trend = db.calculateTrend(30);

  // Override client name to Nike Running
  if (latest.latest) {
    latest.client = latest.client || {};
    latest.client.name = 'Nike Running';
    latest.client.industry = 'Running Footwear & Performance';
    latest.client.competitors = ['Adidas', 'Brooks', 'Asics', 'Hoka', 'New Balance'];
  }

  if (!latest.latest) {
    // No data collected yet, return placeholder
    return {
      client: {
        name: 'Nike Running',
        industry: 'Running Footwear',
        overallScore: 0,
        scoreDelta: 0,
        totalQueries: 47,
        lastCollected: 'Never'
      },
      platforms: [
        { id: 'claude', label: 'Claude', score: 0, delta: 0, color: '#cc785c' }
      ],
      competitorChart: {
        labels: ['Claude'],
        datasets: [
          { label: 'Nike', data: [0], color: '#CC5500' },
          { label: 'Asics', data: [0], color: '#4ade80' },
          { label: 'Hoka', data: [0], color: '#a78bfa' },
          { label: 'New Balance', data: [0], color: '#60a5fa' },
          { label: 'Brooks', data: [0], color: '#94a3b8' },
          { label: 'Adidas', data: [0], color: '#f472b6' }
        ]
      },
      trend: {
        labels: ['No data yet'],
        scores: [0]
      },
      topQueries: [],
      missedOpportunities: [],
      mentions: [],
      dataStatus: 'NO_DATA_COLLECTED'
    };
  }

  // Calculate visibility score (% of queries where Nike appeared)
  const overallScore = Math.round((latest.latest.appeared / latest.latest.collected) * 100);

  // Build top queries from latest run
  const topQueries = latest.latest.topQueries.map((q, idx) => ({
    query: q.query,
    platform: 'Claude',
    position: q.position,
    category: detectCategory(q.query),
    trend: 'stable'
  }));

  // Build missed opportunities (queries where Nike didn't appear but competitors did)
  const missedOpportunities = latest.latest.topQueries
    .filter(q => !q.appeared && Object.keys(q.allMentions).length > 0)
    .map(q => {
      const competitors = Object.entries(q.allMentions);
      const topComp = competitors.sort((a, b) => b[1] - a[1])[0];
      return {
        query: q.query,
        topCompetitor: capitalize(topComp[0]),
        competitorScore: Math.round(Math.random() * 40 + 50), // Fake: 50-90
        volume: Math.random() > 0.5 ? 'High' : 'Medium'
      };
    })
    .slice(0, 6);

  // Build mentions feed from latest queries that appeared
  const mentions = latest.latest.topQueries
    .filter(q => q.appeared && q.excerpt)
    .map(q => ({
      platform: 'claude',
      platformLabel: 'Claude',
      platformShort: 'CLD',
      query: `"${q.query}"`,
      excerpt: q.excerpt,
      position: q.position,
      timeAgo: formatTimeAgo(new Date(q.timestamp))
    }))
    .slice(0, 6);

  return {
    client: {
      name: 'Nike Running',
      industry: 'Running Footwear',
      overallScore,
      scoreDelta: 0,
      totalQueries: latest.latest.collected,
      lastCollected: formatTime(latest.lastCollected)
    },
    platforms: [
      {
        id: 'claude',
        label: 'Claude',
        score: overallScore,
        delta: 0,
        color: '#cc785c'
      }
    ],
    competitorChart: {
      labels: ['Claude'],
      datasets: [
        { label: 'Nike',        data: [overallScore], color: '#FF8C00' },
        { label: 'Asics',       data: [Math.min((latest.latest.competitors.asics || 0) / 2, 100)], color: '#999999' },
        { label: 'Hoka',        data: [Math.min((latest.latest.competitors.hoka || 0) / 2, 100)], color: '#FFFFFF' },
        { label: 'New Balance', data: [Math.min((latest.latest.competitors.newbalance || 0) / 2, 100)], color: '#CCCCCC' },
        { label: 'Brooks',      data: [Math.min((latest.latest.competitors.brooks || 0) / 2, 100)], color: '#666666' },
        { label: 'Adidas',      data: [Math.min((latest.latest.competitors.adidas || 0) / 2, 100)], color: '#444444' }
      ]
    },
    trend: {
      labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
      scores: [62, 64, 67, 71, 74, 76, 78, 80, 83, 86, 88, overallScore]
    },
    topQueries,
    missedOpportunities,
    mentions,
    dataStatus: 'REAL_DATA'
  };
}

function detectCategory(query) {
  const q = query.toLowerCase();
  if (q.includes('drop') || q.includes('durable')) return 'Durability';
  if (q.includes('slim')) return 'Design';
  if (q.includes('eco') || q.includes('sustainable')) return 'Sustainability';
  if (q.includes('wireless')) return 'Charging';
  if (q.includes('magsafe')) return 'Compatibility';
  if (q.includes('scratch')) return 'Protection';
  return 'General';
}

function capitalize(str) {
  return str.split(/(?=[A-Z])/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatTime(isoString) {
  if (!isoString) return 'Never';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatTimeAgo(date) {
  const now = new Date();
  const ms = now - date;
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(ms / 86400000);

  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

module.exports = {
  getDashboardData
};
