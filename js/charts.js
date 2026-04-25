// Chart.js global dark theme defaults
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#666666';
Chart.defaults.borderColor = '#2a2a2a';

const DARK_TOOLTIP = {
  backgroundColor: '#1a1a1a',
  borderColor: '#333333',
  borderWidth: 1,
  titleColor: '#ffffff',
  bodyColor: '#a0a0a0',
  padding: 12,
  cornerRadius: 8,
  displayColors: true,
  boxPadding: 4
};

window.Charts = {

  renderCompetitorChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const datasets = data.datasets.map(ds => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.color + 'cc',
      borderColor: ds.color,
      borderWidth: 1,
      borderRadius: 3,
      borderSkipped: false
    }));

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeOutQuart' },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#a0a0a0',
              padding: 16,
              boxWidth: 12,
              boxHeight: 12,
              font: { size: 11 }
            }
          },
          tooltip: {
            ...DARK_TOOLTIP,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%`
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#1e1e1e' },
            ticks: { color: '#666', font: { size: 11 } }
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: '#1e1e1e' },
            ticks: {
              color: '#666',
              font: { size: 11 },
              callback: v => v + '%'
            }
          }
        }
      }
    });
  },

  renderTrendChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(204, 85, 0, 0.25)');
    gradient.addColorStop(1, 'rgba(204, 85, 0, 0.00)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Nike Visibility',
          data: data.scores,
          borderColor: '#CC5500',
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#CC5500',
          pointBorderColor: '#0f0f0f',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...DARK_TOOLTIP,
            callbacks: {
              label: ctx => ` Visibility: ${ctx.parsed.y}%`
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#1e1e1e' },
            ticks: { color: '#666', font: { size: 11 } }
          },
          y: {
            min: 0,
            max: 60,
            grid: { color: '#1e1e1e' },
            ticks: {
              color: '#666',
              font: { size: 11 },
              callback: v => v + '%'
            }
          }
        }
      }
    });
  }
};
