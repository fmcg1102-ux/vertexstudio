module.exports = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-opus-4-1-20250805'
  },

  client: {
    name: 'Nike Running',
    industry: 'Running Footwear & Performance',
    competitors: ['Adidas', 'Brooks', 'Asics', 'Hoka', 'New Balance']
  },

  queries: [
    // Marathon & distance running
    'Best marathon training shoes 2026',
    'Best marathon shoes under 3 hours',
    'Carbon plate marathon shoes',
    'Best long distance running shoes',
    'Marathon running shoes for beginners',
    'Best shoes for marathon training',
    'Lightest marathon shoes',
    'Best cushioned marathon shoes',

    // Speed work & tempo
    'Best running shoes for speed work',
    'Tempo running shoes',
    'Best track shoes for runners',
    'Fast running shoes 2026',
    'Best shoes for interval training',
    'Lightweight running shoes for speed',

    // Distance & general
    'Best running shoes 2026',
    'Most comfortable running shoes',
    'Best daily training shoes',
    'Running shoes for long distance',
    'Best half marathon shoes',
    'Runner up running shoes',

    // Support & stability
    'Best running shoes for flat feet',
    'Supportive running shoes for pronation',
    'Stability running shoes 2026',
    'Best neutral running shoes',
    'Running shoes for overpronators',

    // Specific conditions
    'Best trail running shoes',
    'Road running shoes vs trail',
    'Best running shoes for wet weather',
    'Running shoes for outdoor terrain',
    'Best traction running shoes',

    // Performance features
    'Carbon plate running shoes comparison',
    'Best responsive running shoes',
    'Energy return running shoes',
    'Bounce in running shoes',
    'Best cushioning technology running shoes',

    // Price & value
    'Best budget running shoes',
    'Best running shoes under $100',
    'Value running shoes 2026',
    'Best affordable marathon shoes',

    // Demographics
    'Best running shoes for women',
    'Best running shoes for men',
    'Best running shoes for wide feet',
    'Running shoes for narrow feet',

    // Specific activities
    'Best running shoes for sprinting',
    'Running shoes for cross country',
    'Best treadmill running shoes',
    'Running shoes for track and field'
  ],

  platforms: [
    { id: 'claude', label: 'Claude', color: '#cc785c' },
    { id: 'chatgpt', label: 'ChatGPT', color: '#10a37f' },
    { id: 'perplexity', label: 'Perplexity', color: '#7c3aed' }
  ],

  dataFile: './data/mous-visibility.json'
};
