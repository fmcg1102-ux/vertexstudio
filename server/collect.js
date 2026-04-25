/**
 * collect.js - Standalone script to collect data from Claude
 * Run with: node server/collect.js
 */

const { collectData } = require('./collector');

async function main() {
  try {
    await collectData();
    console.log('\n✅ Collection complete. Dashboard data updated.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
