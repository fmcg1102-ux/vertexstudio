/**
 * Report Generator: Creates PDF reports of AEO/GEO visibility data
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('./database');

const ACCENT_COLOR = '#CC5500';
const BG_PRIMARY = '#ffffff';
const BG_LIGHT = '#f9f9f9';
const TEXT_PRIMARY = '#000000';
const TEXT_MUTED = '#666666';

function generateReport(outputPath) {
  const data = db.getLatestData();

  if (!data.latest) {
    throw new Error('No data collected yet. Run npm run collect first.');
  }

  const doc = new PDFDocument({
    margin: 40,
    size: 'A4'
  });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // ── Page 1: Cover ──────────────────────────────────────────────
  doc.fillColor(BG_LIGHT);
  doc.rect(0, 0, doc.page.width, doc.page.height).fill();

  doc.fillColor(ACCENT_COLOR);
  doc.fontSize(48).font('Helvetica-Bold').text('Vertex Studio', 40, 120);

  doc.fillColor(TEXT_PRIMARY);
  doc.fontSize(24).font('Helvetica').text('AEO & GEO Visibility Report', 40, 180);

  doc.fontSize(16).fillColor(TEXT_MUTED).text(data.client.name, 40, 220);
  doc.fontSize(12).text(data.client.industry, 40, 245);

  // Big visibility score
  doc.fontSize(96).fillColor(ACCENT_COLOR).font('Helvetica-Bold').text(
    `${data.latest.appeared}/${data.latest.collected}`,
    40,
    350,
    { align: 'center', width: doc.page.width - 80 }
  );

  doc.fontSize(20).fillColor(TEXT_PRIMARY).text('Visibility Score', {
    align: 'center',
    width: doc.page.width - 80
  });

  const scorePercent = Math.round((data.latest.appeared / data.latest.collected) * 100);
  doc.fontSize(28).fillColor(ACCENT_COLOR).text(`${scorePercent}%`, {
    align: 'center',
    width: doc.page.width - 80,
    lineGap: 10
  });

  // Footer
  doc.fontSize(11).fillColor(TEXT_MUTED).text(
    `Generated: ${new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`,
    40,
    doc.page.height - 50,
    { align: 'center' }
  );

  doc.addPage();

  // ── Page 2: Executive Summary ──────────────────────────────────
  doc.fillColor(BG_PRIMARY);
  doc.rect(0, 0, doc.page.width, doc.page.height).fill();

  heading(doc, 'Executive Summary', 40, 40);

  doc.fillColor(TEXT_PRIMARY).fontSize(12);
  doc.text(`${data.client.name} is appearing in ${scorePercent}% of AI-generated answers across tracked queries.`, 40, 120);
  doc.text(`This represents ${data.latest.collected} tracked search queries across Claude AI.`, 40, 145);

  doc.fontSize(10).fillColor(TEXT_MUTED);
  doc.text(
    `Visibility in AI answers is critical for reaching customers who use ChatGPT, Claude, Gemini, Perplexity, and other AI platforms for product recommendations. A higher visibility score indicates stronger presence in AI-generated content.`,
    40,
    175,
    { width: doc.page.width - 80, lineGap: 5 }
  );

  // Key metrics boxes
  const metrics = [
    { label: 'Queries Tracked', value: data.latest.collected },
    { label: 'Appearances', value: data.latest.appeared },
    { label: 'Visibility Score', value: `${scorePercent}%` },
    { label: 'Avg Position', value: data.latest.averagePosition ? `#${data.latest.averagePosition}` : 'N/A' }
  ];

  let metricsY = 270;
  const boxWidth = (doc.page.width - 120) / 2;
  const boxHeight = 80;

  metrics.forEach((metric, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 40 + col * (boxWidth + 20);
    const y = metricsY + row * (boxHeight + 15);

    // Box background
    doc.fillColor('#ffffff');
    doc.rect(x, y, boxWidth, boxHeight).fill();
    doc.strokeColor('#000000').lineWidth(2).rect(x, y, boxWidth, boxHeight).stroke();

    // Label
    doc.fillColor(TEXT_MUTED).fontSize(10).text(metric.label, x + 12, y + 15);

    // Value
    doc.fillColor(ACCENT_COLOR).fontSize(28).font('Helvetica-Bold').text(
      metric.value,
      x + 12,
      y + 35
    );

    doc.font('Helvetica');
  });

  doc.addPage();

  // ── Page 3: Top Ranked Queries ─────────────────────────────────
  doc.fillColor(BG_PRIMARY);
  doc.rect(0, 0, doc.page.width, doc.page.height).fill();

  heading(doc, 'Top Ranked Queries', 40, 40);
  doc.fontSize(10).fillColor(TEXT_MUTED).text(
    'Queries where Nike appears in AI-generated answers',
    40,
    75
  );

  let tableY = 110;
  const topQueries = data.latest.topQueries.slice(0, 10);

  // Table header
  doc.fillColor('#ffffff');
  doc.rect(40, tableY, doc.page.width - 80, 30).fill();
  doc.strokeColor('#000000').lineWidth(2).rect(40, tableY, doc.page.width - 80, 30).stroke();

  doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold');
  doc.text('Query', 50, tableY + 10, { width: 280 });
  doc.text('Position', 340, tableY + 10, { width: 60 });
  doc.text('Category', 410, tableY + 10, { width: 120 });

  tableY += 35;

  topQueries.forEach((q, idx) => {
    if (tableY > doc.page.height - 80) {
      doc.addPage();
      doc.fillColor(BG_PRIMARY);
      doc.rect(0, 0, doc.page.width, doc.page.height).fill();
      tableY = 40;
    }

    const bgColor = '#ffffff';
    doc.fillColor(bgColor);
    doc.rect(40, tableY, doc.page.width - 80, 25).fill();

    doc.fillColor(TEXT_PRIMARY).fontSize(9).font('Helvetica');
    doc.text(q.query.substring(0, 35), 50, tableY + 8, { width: 280 });

    doc.fillColor(ACCENT_COLOR).font('Helvetica-Bold');
    doc.text(`#${q.position}`, 340, tableY + 8);

    doc.fillColor(TEXT_MUTED).font('Helvetica');
    doc.text(q.category, 410, tableY + 8, { width: 120 });

    tableY += 28;
  });

  doc.addPage();

  // ── Page 4: Competitor Analysis ────────────────────────────────
  doc.fillColor(BG_PRIMARY);
  doc.rect(0, 0, doc.page.width, doc.page.height).fill();

  heading(doc, 'Competitor Analysis', 40, 40);

  doc.fontSize(10).fillColor(TEXT_MUTED).text(
    'How often competitors appear in the same queries',
    40,
    75
  );

  let compY = 115;
  const competitors = Object.entries(data.latest.competitors).sort((a, b) => b[1] - a[1]);

  competitors.forEach(([brand, count], idx) => {
    doc.fillColor(TEXT_PRIMARY).fontSize(11).font('Helvetica-Bold');
    doc.text(capitalize(brand), 40, compY);

    doc.fillColor(TEXT_MUTED).fontSize(10).font('Helvetica');
    doc.text(`${count} mentions`, 40, compY + 20);

    // Bar
    const barWidth = (count / Math.max(...competitors.map(c => c[1]))) * 300;
    doc.fillColor(ACCENT_COLOR).rect(40, compY + 40, barWidth, 12).fill();

    compY += 80;
  });

  doc.addPage();

  // ── Page 5: Recommendations ────────────────────────────────────
  doc.fillColor(BG_PRIMARY);
  doc.rect(0, 0, doc.page.width, doc.page.height).fill();

  heading(doc, 'Recommendations', 40, 40);

  const recommendations = [
    {
      title: 'Optimize for High-Volume Queries',
      text: 'Focus content and product features on the queries where you rank highest. These have proven search volume in AI platforms.'
    },
    {
      title: 'Address Gaps vs Top Competitors',
      text: `${Object.entries(data.latest.competitors).sort((a, b) => b[1] - a[1])[0][0]} appears more frequently. Analyze what they mention that you don't.`
    },
    {
      title: 'Create Comparison Content',
      text: 'Develop content comparing your products to competitors mentioned in these queries. This increases likelihood of appearing alongside them in AI answers.'
    },
    {
      title: 'Monitor Trends',
      text: 'Track visibility monthly to identify rising opportunities and declining visibility. Adjust strategy based on these trends.'
    }
  ];

  let recY = 110;
  recommendations.forEach((rec, idx) => {
    doc.fillColor(ACCENT_COLOR).fontSize(11).font('Helvetica-Bold');
    doc.text(`${idx + 1}. ${rec.title}`, 40, recY);

    doc.fillColor(TEXT_MUTED).fontSize(9).font('Helvetica');
    doc.text(rec.text, 40, recY + 25, { width: doc.page.width - 80, lineGap: 4 });

    recY += 100;
  });

  doc.addPage();

  // ── Page 6: Methodology ────────────────────────────────────────
  doc.fillColor(BG_PRIMARY);
  doc.rect(0, 0, doc.page.width, doc.page.height).fill();

  heading(doc, 'Methodology', 40, 40);

  doc.fontSize(10).fillColor(TEXT_PRIMARY).font('Helvetica-Bold').text('Data Collection', 40, 110);
  doc.fontSize(9).fillColor(TEXT_MUTED).font('Helvetica').text(
    `This report analyzed ${data.latest.collected} search queries across Claude AI. Queries span product categories relevant to ${data.client.name}.`,
    40,
    135,
    { width: doc.page.width - 80, lineGap: 4 }
  );

  doc.fontSize(10).fillColor(TEXT_PRIMARY).font('Helvetica-Bold').text('Visibility Score', 40, 220);
  doc.fontSize(9).fillColor(TEXT_MUTED).font('Helvetica').text(
    'The visibility score represents the percentage of tracked queries where the brand appears in AI-generated answers. A higher score indicates stronger presence in AI-generated recommendations.',
    40,
    245,
    { width: doc.page.width - 80, lineGap: 4 }
  );

  doc.fontSize(10).fillColor(TEXT_PRIMARY).font('Helvetica-Bold').text('Ranking Position', 40, 330);
  doc.fontSize(9).fillColor(TEXT_MUTED).font('Helvetica').text(
    'Position indicates the order of mentions within AI responses. Position #1 means the brand was mentioned first, indicating highest prominence in the answer.',
    40,
    355,
    { width: doc.page.width - 80, lineGap: 4 }
  );

  // Footer
  doc.fontSize(8).fillColor(TEXT_MUTED).text(
    'Vertex Studio © 2026 | Confidential',
    40,
    doc.page.height - 50,
    { align: 'center' }
  );

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

function heading(doc, text, x, y) {
  doc.fillColor(ACCENT_COLOR).fontSize(28).font('Helvetica-Bold').text(text, x, y);
  doc.strokeColor('#000000').lineWidth(2).moveTo(x, y + 35).lineTo(doc.page.width - 40, y + 35).stroke();
}

function capitalize(str) {
  return str.split(/(?=[A-Z])/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

module.exports = { generateReport };
