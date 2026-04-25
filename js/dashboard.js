document.addEventListener('DOMContentLoaded', function () {

  // Guard — redirect to login if not authenticated
  if (sessionStorage.getItem('vs_auth') !== 'true') {
    window.location.href = 'login.html';
    return;
  }

  const D = window.DASHBOARD_DATA;

  // ── 1. Header ─────────────────────────────────────────────
  document.getElementById('clientName').textContent = D.client.name;
  document.getElementById('lastUpdated').textContent =
    'Last updated: ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  // ── 2. KPI score count-up ─────────────────────────────────
  const scoreEl = document.getElementById('overallScore');
  animateCountUp(scoreEl, D.client.overallScore, 1200);

  const delta = D.client.scoreDelta;
  const deltaEl = document.getElementById('scoreDelta');
  deltaEl.textContent = (delta >= 0 ? '▲ ' : '▼ ') + Math.abs(delta) + '% vs last month';
  deltaEl.className = 'badge ' + (delta >= 0 ? 'badge--positive' : 'badge--negative');

  document.getElementById('scoreContext').textContent =
    'across 5 AI platforms, ' + D.client.totalQueries + ' tracked queries';

  // ── 3. Platform cards ─────────────────────────────────────
  const grid = document.getElementById('platformGrid');
  D.platforms.forEach(p => {
    const isPos = p.delta >= 0;
    const card = document.createElement('div');
    card.className = 'card platform-card';
    card.innerHTML = `
      <div class="platform-card__header">
        <span class="platform-card__name">${p.label}</span>
        <span class="platform-card__dot" style="background:${p.color}"></span>
      </div>
      <div class="platform-card__score">${p.score}<span>%</span></div>
      <div class="progress-bar">
        <div class="progress-bar__fill" style="width:0%;background:${p.color}" data-target="${p.score}"></div>
      </div>
      <span class="platform-card__delta badge ${isPos ? 'badge--positive' : 'badge--negative'}">
        ${isPos ? '▲' : '▼'} ${Math.abs(p.delta)}% MoM
      </span>
    `;
    grid.appendChild(card);
  });

  // Animate progress bars after a short delay
  setTimeout(() => {
    document.querySelectorAll('.progress-bar__fill[data-target]').forEach(el => {
      el.style.width = el.dataset.target + '%';
    });
  }, 200);

  // ── 4. Charts ─────────────────────────────────────────────
  Charts.renderCompetitorChart('competitorChart', D.competitorChart);
  Charts.renderTrendChart('trendChart', D.trend);

  // ── 5. Top ranked queries table ───────────────────────────
  const tbody = document.getElementById('topQueriesBody');
  D.topQueries.forEach(q => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--text-primary);font-weight:500;max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${q.query}</td>
      <td><span class="badge badge--neutral">${q.platform}</span></td>
      <td style="font-weight:600;color:${q.position === 1 ? 'var(--accent)' : 'var(--text-secondary)'};">#${q.position}</span></td>
      <td>${q.category}</td>
      <td>${trendIcon(q.trend)}</td>
    `;
    tbody.appendChild(tr);
  });

  // ── 6. Missed opportunities ───────────────────────────────
  const missedList = document.getElementById('missedList');
  D.missedOpportunities.forEach(m => {
    const li = document.createElement('li');
    li.className = 'missed-item';
    li.innerHTML = `
      <div class="missed-item__left">
        <p class="missed-item__query">${m.query}</p>
        <p class="missed-item__competitor">Leading: ${m.topCompetitor}</p>
      </div>
      <div class="missed-item__right">
        <span class="missed-item__gap">${m.competitorScore}%</span>
        <span class="badge ${m.volume === 'High' ? 'badge--accent' : 'badge--neutral'}">${m.volume}</span>
      </div>
    `;
    missedList.appendChild(li);
  });

  // ── 7. Mentions feed ──────────────────────────────────────
  const feed = document.getElementById('mentionsFeed');
  D.mentions.forEach(m => {
    feed.appendChild(buildFeedItem(m));
  });

  // ── 8. Logout ─────────────────────────────────────────────
  document.getElementById('logoutBtn').addEventListener('click', function () {
    sessionStorage.removeItem('vs_auth');
    window.location.href = 'login.html';
  });

  // ── 9. Live feed simulation ───────────────────────────────
  let feedIndex = 0;
  setInterval(function () {
    feedIndex = (feedIndex + 1) % D.mentions.length;
    const item = buildFeedItem(D.mentions[feedIndex]);
    item.classList.add('feed-item--new');
    feed.insertBefore(item, feed.firstChild);

    // Cap at 8 items
    while (feed.children.length > 8) {
      feed.removeChild(feed.lastChild);
    }

    // Remove highlight class after animation
    setTimeout(() => item.classList.remove('feed-item--new'), 5000);
  }, 45000);

});

// ── Helpers ───────────────────────────────────────────────────

function animateCountUp(el, target, duration) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function trendIcon(trend) {
  if (trend === 'up')   return '<span class="trend-up"  title="Improving">▲</span>';
  if (trend === 'down') return '<span class="trend-down" title="Declining">▼</span>';
  return '<span class="trend-same" title="Stable">—</span>';
}

function buildFeedItem(m) {
  const posLabel = m.position === 1 ? 'Ranked #1' : m.position === 2 ? 'Ranked #2' : 'Ranked #' + m.position;
  const posBadge = m.position === 1 ? 'badge--positive' : m.position === 2 ? 'badge--accent' : 'badge--neutral';

  const div = document.createElement('div');
  div.className = 'feed-item';
  div.innerHTML = `
    <div class="feed-item__icon feed-item__icon--${m.platform}">${m.platformShort}</div>
    <div class="feed-item__body">
      <p class="feed-item__query">${m.query}</p>
      <p class="feed-item__excerpt">${m.excerpt}</p>
      <div class="feed-item__meta">
        <span>${m.platformLabel}</span>
        <span>·</span>
        <span>Position ${m.position}</span>
        <span>·</span>
        <span>${m.timeAgo}</span>
      </div>
    </div>
    <div class="feed-item__badge">
      <span class="badge ${posBadge}">${posLabel}</span>
    </div>
  `;
  return div;
}
