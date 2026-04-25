/**
 * Parser: Detects brand mentions in Claude responses
 * Returns structured data about which brands appear and where
 */

const BRANDS = {
  nike: {
    names: ['nike', 'nike running', 'nike shoes', 'nike alphafly', 'nike vaporfly', 'nike pegasus', 'nike structure', 'nike streakfly'],
    score: 100
  },
  adidas: {
    names: ['adidas', 'adidas running', 'adidas shoes', 'adidas adizero', 'adidas boost', 'adidas ultraboost'],
    score: 90
  },
  brooks: {
    names: ['brooks', 'brooks running', 'brooks shoes', 'brooks glycerin', 'brooks ghost', 'brooks adrenaline'],
    score: 85
  },
  asics: {
    names: ['asics', 'asics running', 'asics shoes', 'asics gel', 'asics nimbus', 'asics kayano'],
    score: 85
  },
  hoka: {
    names: ['hoka', 'hoka running', 'hoka shoes', 'hoka clifton', 'hoka speedgoat'],
    score: 95
  },
  newbalance: {
    names: ['new balance', 'newbalance', 'new balance running', 'new balance shoes', 'nb shoes', 'nb running'],
    score: 80
  }
};

function parseResponse(responseText, query, platform = 'claude') {
  const text = responseText.toLowerCase();
  const result = {
    query,
    platform,
    timestamp: new Date().toISOString(),
    appeared: false,
    position: null,
    mentionCount: 0,
    excerpt: null,
    allMentions: {}
  };

  // Check for Nike (primary brand)
  let minPos = Infinity;
  BRANDS.nike.names.forEach(name => {
    const regex = new RegExp(`\\b${name}\\b`, 'gi');
    const matches = text.matchAll(regex);
    const positions = Array.from(matches).map((m, i) => ({
      index: m.index,
      matchNum: i + 1
    }));
    if (positions.length > 0) {
      result.appeared = true;
      result.mentionCount += positions.length;
      minPos = Math.min(minPos, positions[0].matchNum);
    }
  });

  if (result.appeared) {
    result.position = minPos;
    // Extract a snippet around first mention
    const nikeIndex = text.search(/\bnike\b/i);
    if (nikeIndex !== -1) {
      const start = Math.max(0, nikeIndex - 80);
      const end = Math.min(text.length, nikeIndex + 150);
      result.excerpt = '...' + responseText.substring(start, end).trim() + '...';
    }
  }

  // Check for competitors
  Object.entries(BRANDS).forEach(([brand, config]) => {
    if (brand === 'nike') return;
    let count = 0;
    config.names.forEach(name => {
      const regex = new RegExp(`\\b${name}\\b`, 'gi');
      count += (text.match(regex) || []).length;
    });
    if (count > 0) {
      result.allMentions[brand] = count;
    }
  });

  return result;
}

module.exports = { parseResponse };
