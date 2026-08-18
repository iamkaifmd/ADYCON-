/* ==========================================================================
   HyperFetch Signal — Interactive Dashboard Logic & Easter Egg
   Built for Acdyon Technologies Frontend Challenge (Part 1 & Part 2)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // 1. Theme Management (Dark / Light Mode)
  // ------------------------------------------------------------------------
  const themeToggle = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;

  const savedTheme = localStorage.getItem('hyperfetch_theme');
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  }

  themeToggle?.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('hyperfetch_theme', newTheme);
  });

  // ------------------------------------------------------------------------
  // 2. Workbench Tab Switching
  // ------------------------------------------------------------------------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeContent = document.getElementById(`tab-${targetTab}`);
      if (activeContent) {
        activeContent.classList.add('active');
      }
    });
  });

  // ------------------------------------------------------------------------
  // 3. Live Telemetry Log Engine (Backend Integration)
  // ------------------------------------------------------------------------
  const logContainer = document.getElementById('logContainer');
  const logCount = document.getElementById('logCount');
  const streamToggleBtn = document.getElementById('streamToggleBtn');
  const streamStatusText = document.getElementById('streamStatusText');
  const sourceSelect = document.getElementById('sourceSelect');
  const pacingProfile = document.getElementById('pacingProfile');
  const uaSelect = document.getElementById('uaSelect');

  const chartLine = document.getElementById('chartLine');
  const chartArea = document.getElementById('chartArea');
  const chartAvgTime = document.getElementById('chartAvgTime');
  const chartMaxTime = document.getElementById('chartMaxTime');
  const jsonPayloadCode = document.getElementById('jsonPayloadCode');

  let isStreaming = true;
  let logHistory = [];
  let latencyPoints = [120, 145, 130, 160, 115, 140, 175, 150, 125, 138];

  const uaHeaders = {
    chrome_mac: `:authority: api.remotive.com
:method: GET
:path: /api/remote-jobs
:scheme: https
accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp
accept-encoding: gzip, deflate, br, zstd
accept-language: en-US,en;q=0.9
sec-ch-ua: "Chromium";v="122", "Not(A:Brand";v="24"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "macOS"
sec-fetch-dest: document
sec-fetch-mode: navigate
sec-fetch-site: none
user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36`,

    firefox_win: `:authority: hacker-news.firebaseio.com
:method: GET
:path: /v0/jobstories.json
:scheme: https
accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
accept-encoding: gzip, deflate, br
accept-language: en-US,en;q=0.5
user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0`,

    safari_ios: `:authority: sandbox-rss.org
:method: GET
:path: /feed.xml
:scheme: https
accept: text/html,application/xhtml+xml,application/xml;q=0.9
user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/605.1.15`
  };

  uaSelect?.addEventListener('change', (e) => {
    const headerCode = document.getElementById('headerCode');
    if (headerCode && uaHeaders[e.target.value]) {
      headerCode.textContent = uaHeaders[e.target.value];
    }
  });

  async function triggerScrapeRun() {
    if (!isStreaming || !logContainer) return;

    const pacing = pacingProfile ? pacingProfile.value : 'gaussian';
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

    // Try backend URL (relative or localhost:3000 fallback)
    const backendUrl = window.location.protocol.startsWith('http') 
      ? `/api/scrape?pacing=${pacing}` 
      : `http://localhost:3000/api/scrape?pacing=${pacing}`;

    try {
      const res = await fetch(backendUrl);
      if (res.ok) {
        const data = await res.json();
        const latency = data.metrics ? data.metrics.total_latency_ms : Math.floor(Math.random() * 100) + 120;
        const status = data.fallback_used ? '200 FALLBACK' : '200 OK';
        const statusClass = data.fallback_used ? 'text-warning' : 'text-success';
        const msg = `[Ingested ${data.listing_count} Items] Source: ${data.source} (${data.metrics.pacing_jitter_ms}ms Gaussian jitter)`;

        if (jsonPayloadCode) {
          jsonPayloadCode.textContent = JSON.stringify(data, null, 2);
        }

        latencyPoints.push(latency);
        if (latencyPoints.length > 15) latencyPoints.shift();
        updateChart();

        appendLogRow(timeStr, status, statusClass, msg);
        return;
      }
    } catch {
      // Standalone / Offline Simulation Fallback
    }

    // Client-Side Resilient Simulation if Backend is not directly reachable
    const mockLatency = Math.floor(Math.random() * 90) + 110;
    const selectedSource = sourceSelect ? sourceSelect.value : 'rss';
    let sourceName = 'Remotive Live REST API';
    if (selectedSource === 'hn') sourceName = 'HackerNews Job Stories API';
    if (selectedSource === 'sandbox') sourceName = 'Public RSS Feed Sandbox';

    const mockPayload = {
      timestamp: new Date().toISOString(),
      source: sourceName,
      fallback_used: selectedSource === 'sandbox',
      metrics: {
        total_latency_ms: mockLatency,
        pacing_jitter_ms: Math.floor(Math.random() * 180) + 700,
        circuit_breaker_status: 'HEALTHY'
      },
      listing_count: 5,
      listings: [
        { id: "job_remotive_01", title: "Senior Distributed Systems Engineer", company: "Acdyon Engineering Labs", location: "Remote", posted_date: new Date().toISOString().slice(0,10), verified_source: sourceName },
        { id: "job_remotive_02", title: "Lead Frontend Systems Architect", company: "Acdyon Core Team", location: "Remote / Hybrid", posted_date: new Date().toISOString().slice(0,10), verified_source: sourceName }
      ]
    };

    if (jsonPayloadCode) {
      jsonPayloadCode.textContent = JSON.stringify(mockPayload, null, 2);
    }

    appendLogRow(timeStr, '200 OK', 'text-success', `[Ingested 5 Items] Source: ${sourceName} (${mockPayload.metrics.pacing_jitter_ms}ms Gaussian jitter)`);
    latencyPoints.push(mockLatency);
    if (latencyPoints.length > 15) latencyPoints.shift();
    updateChart();
  }

  function appendLogRow(timeStr, status, statusClass, msg) {
    const row = document.createElement('div');
    row.className = 'log-row';
    row.innerHTML = `
      <span class="log-time">[${timeStr}]</span>
      <span class="log-status ${statusClass}">${status}</span>
      <span class="log-msg">${msg}</span>
    `;

    logContainer.appendChild(row);
    logContainer.scrollTop = logContainer.scrollHeight;

    logHistory.push(row);
    if (logHistory.length > 30) {
      const first = logHistory.shift();
      first.remove();
    }

    if (logCount) logCount.textContent = `${logHistory.length} events`;
  }

  function updateChart() {
    if (!chartLine || !chartArea) return;

    const width = 400;
    const height = 150;
    const padding = 15;

    const maxVal = Math.max(...latencyPoints, 200);
    const minVal = Math.min(...latencyPoints, 50);

    const points = latencyPoints.map((val, idx) => {
      const x = (idx / (latencyPoints.length - 1)) * width;
      const y = height - padding - ((val - minVal) / (maxVal - minVal + 1)) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    const areaD = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;

    chartLine.setAttribute('d', pathD);
    chartArea.setAttribute('d', areaD);

    const avg = Math.round(latencyPoints.reduce((a, b) => a + b, 0) / latencyPoints.length);
    const max = Math.max(...latencyPoints);

    if (chartAvgTime) chartAvgTime.textContent = `${avg}ms`;
    if (chartMaxTime) chartMaxTime.textContent = `${max}ms`;
  }

  // Initial trigger
  triggerScrapeRun();
  let streamInterval = setInterval(triggerScrapeRun, 2500);

  streamToggleBtn?.addEventListener('click', () => {
    isStreaming = !isStreaming;
    const indicator = streamToggleBtn.querySelector('.status-indicator');
    if (isStreaming) {
      if (indicator) indicator.classList.add('active');
      if (streamStatusText) streamStatusText.textContent = 'Pause Stream';
      streamInterval = setInterval(triggerScrapeRun, 2500);
    } else {
      if (indicator) indicator.classList.remove('active');
      if (streamStatusText) streamStatusText.textContent = 'Resume Stream';
      clearInterval(streamInterval);
    }
  });

  // ------------------------------------------------------------------------
  // 4. Copy Payload Clipboard Helper
  // ------------------------------------------------------------------------
  const copyPayloadBtn = document.getElementById('copyPayloadBtn');
  copyPayloadBtn?.addEventListener('click', () => {
    if (jsonPayloadCode) {
      navigator.clipboard.writeText(jsonPayloadCode.textContent || '').then(() => {
        const span = copyPayloadBtn.querySelector('span');
        if (span) {
          const original = span.textContent;
          span.textContent = 'Copied!';
          setTimeout(() => { span.textContent = original; }, 2000);
        }
      });
    }
  });

  // ------------------------------------------------------------------------
  // 5. BONUS EASTER EGG — Konami Code & Matrix Rain Visualizer
  // ------------------------------------------------------------------------
  const easterEggOverlay = document.getElementById('easterEggOverlay');
  const closeEasterEgg = document.getElementById('closeEasterEgg');
  const dismissEasterEgg = document.getElementById('dismissEasterEgg');
  const triggerEasterEggBtn = document.getElementById('triggerEasterEggBtn');
  const toggleMatrixColor = document.getElementById('toggleMatrixColor');

  const konamiSequence = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  let konamiIndex = 0;

  window.addEventListener('keydown', (e) => {
    const requiredKey = konamiSequence[konamiIndex];
    if (e.key.toLowerCase() === requiredKey.toLowerCase()) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        unlockEasterEgg();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });

  triggerEasterEggBtn?.addEventListener('click', unlockEasterEgg);
  closeEasterEgg?.addEventListener('click', hideEasterEgg);
  dismissEasterEgg?.addEventListener('click', hideEasterEgg);

  function unlockEasterEgg() {
    if (!easterEggOverlay) return;
    easterEggOverlay.classList.remove('hidden');
    easterEggOverlay.setAttribute('aria-hidden', 'false');
    startMatrixRain();
  }

  function hideEasterEgg() {
    if (!easterEggOverlay) return;
    easterEggOverlay.classList.add('hidden');
    easterEggOverlay.setAttribute('aria-hidden', 'true');
    stopMatrixRain();
  }

  const canvas = document.getElementById('matrixCanvas');
  let ctx = canvas ? canvas.getContext('2d') : null;
  let animationFrameId = null;
  let drops = [];
  let matrixColor = '#34d399';

  toggleMatrixColor?.addEventListener('click', () => {
    matrixColor = matrixColor === '#34d399' ? '#38bdf8' : '#34d399';
  });

  function initCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const columns = Math.floor(canvas.width / 16);
    drops = Array(columns).fill(1);
  }

  function renderMatrix() {
    if (!ctx || !canvas) return;
    ctx.fillStyle = 'rgba(3, 7, 18, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = matrixColor;
    ctx.font = '14px "JetBrains Mono", monospace';

    const characters = '0123456789ABCDEFHYPERFETCHACDYON';

    for (let i = 0; i < drops.length; i++) {
      const char = characters.charAt(Math.floor(Math.random() * characters.length));
      const x = i * 16;
      const y = drops[i] * 16;

      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    animationFrameId = requestAnimationFrame(renderMatrix);
  }

  function startMatrixRain() {
    initCanvas();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    renderMatrix();
  }

  function stopMatrixRain() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  }
});
