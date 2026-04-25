/**
 * Collector: Runs queries against multiple AI platforms and collects real data
 */

const Anthropic = require('@anthropic-ai/sdk');
const config = require('./config');
const { parseResponse } = require('./parser');
const db = require('./database');

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey
});

// Placeholder APIs for ChatGPT and Perplexity (would need their API keys)
const CHATGPT_API_KEY = process.env.OPENAI_API_KEY || null;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || null;

async function queryPlatform(platform, query) {
  const systemPrompt = `You are a helpful assistant recommending running shoes.
When asked about running shoes, provide genuine recommendations based on actual products available in the market.
Include specific brand names, shoe models, and product features (cushioning, responsiveness, fit) to make your answer useful.`;

  if (platform === 'claude') {
    const message = await anthropic.messages.create({
      model: config.anthropic.model,
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: query }]
    });
    return message.content[0].type === 'text' ? message.content[0].text : '';
  }

  if (platform === 'chatgpt') {
    if (!CHATGPT_API_KEY) {
      throw new Error('OPENAI_API_KEY not set. ChatGPT queries disabled.');
    }
    // Would use OpenAI SDK here
    // Placeholder for now
    return '';
  }

  if (platform === 'perplexity') {
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY not set. Perplexity queries disabled.');
    }
    // Would use Perplexity API here
    // Placeholder for now
    return '';
  }

  throw new Error(`Unknown platform: ${platform}`);
}

async function collectData() {
  console.log('\n📊 Starting data collection for Nike Running...');
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`🔍 Queries: ${config.queries.length}`);
  console.log(`📱 Platforms: ${config.platforms.map(p => p.label).join(', ')}`);
  console.log('─'.repeat(60));

  const results = [];
  let queryCount = 0;

  // For now, only collect from Claude (has API key)
  // To expand: add OPENAI_API_KEY and PERPLEXITY_API_KEY to environment
  const activePlatforms = config.platforms.filter(p => {
    if (p.id === 'claude') return true;
    if (p.id === 'chatgpt' && CHATGPT_API_KEY) return true;
    if (p.id === 'perplexity' && PERPLEXITY_API_KEY) return true;
    return false;
  });

  if (activePlatforms.length === 0) {
    console.error('❌ No API keys configured. Please set ANTHROPIC_API_KEY.');
    process.exit(1);
  }

  console.log(`✅ Active platforms: ${activePlatforms.map(p => p.label).join(', ')}\n`);

  for (const query of config.queries) {
    console.log(`\n🎯 Query: "${query}"`);

    for (const platform of activePlatforms) {
      try {
        console.log(`   🌐 ${platform.label}...`);
        const responseText = await queryPlatform(platform.id, query);

        if (!responseText) {
          console.log(`      ⚠️  No response`);
          continue;
        }

        const parsed = parseResponse(responseText, query, platform.id);
        results.push(parsed);
        queryCount++;

        if (parsed.appeared) {
          console.log(`      ✅ Nike at #${parsed.position}`);
        } else {
          const competitors = Object.keys(parsed.allMentions);
          if (competitors.length > 0) {
            console.log(`      ❌ Not mentioned. Competitors: ${competitors.join(', ')}`);
          } else {
            console.log(`      ❌ Not mentioned`);
          }
        }

      } catch (error) {
        if (error.message.includes('not set')) {
          console.log(`      ⏭️  Skipped (API key not configured)`);
        } else {
          console.error(`      ⚠️  Error: ${error.message}`);
        }
      }
    }
  }

  // Save to database
  const daily = db.addRun(results);

  console.log('\n' + '─'.repeat(60));
  console.log(`📈 Daily Summary`);
  console.log(`   Total queries collected: ${queryCount}`);
  console.log(`   Nike appeared in: ${daily.appeared}/${daily.collected} (${Math.round((daily.appeared/daily.collected)*100)}%)`);
  if (daily.averagePosition) {
    console.log(`   Average position: #${daily.averagePosition}`);
  }
  if (Object.keys(daily.competitors).length > 0) {
    console.log(`   Competitors mentioned:`);
    Object.entries(daily.competitors).forEach(([brand, count]) => {
      console.log(`     - ${brand}: ${count} times`);
    });
  }
  console.log('─'.repeat(60));
  console.log(`\n💡 To track ChatGPT and Perplexity, set environment variables:`);
  console.log(`   OPENAI_API_KEY=sk-...`);
  console.log(`   PERPLEXITY_API_KEY=pplx-...`);

  return results;
}

module.exports = { collectData };
