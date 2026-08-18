# DECISIONS.md — Acdyon Technologies Frontend Challenge

**Track Selected**: Part 2 — The Premium Home Page  
**Project**: HyperFetch Signal (Resilient Ingestion Telemetry Workbench)  
**Author**: Engineering Candidate  

---

### 1. Why this Ingestion Strategy over the Obvious Alternative?

**The Obvious Alternative Rejected**: Headless browser automation clusters (Puppeteer / Playwright) spinning up real Chromium instances for every ingestion cycle.

**Why Rejected**: 
1. **Detection Vectors**: Modern anti-bot gateways (Cloudflare, Akamai, Kasada) detect headless Chromium via distinct Chrome DevTools Protocol (`window.navigator.webdriver`, missing `chrome.runtime`, WebGL renderer fingerprint consistency, and HTTP/2 TLS ClientHello JA3/JA4 mismatches).
2. **Resource Overhead**: Spawning full browser instances consumes ~300MB RAM per process. At 50 concurrent targets, infrastructure cost scales exponentially.

**Our Ingestion Architecture**: Lightweight HTTP/2 request pipelines with **TLS Fingerprint Spoofing (JA3/JA4 alignment)** and **Gaussian Delay Pacing**. We match client-hello cipher suites to declared User-Agent strings and apply natural bell-curve jitter distributions between requests.

---

### 2. Time-Limit Trade-off & "What We'd Do With a Real Week"

**Trade-off Made**: Under the time limit, we built an in-browser live SVG telemetry simulator fed by public RSS/Sandbox API endpoints rather than deploying a multi-region distributed residential proxy cluster.

**What We’d Build in a Real Week**:
1. **Automated AST Schema Drift Detection**: Parse DOM AST structures on every run. If a target site updates CSS class names overnight, trigger an automated semantic selector fallback (e.g. mapping `article h2` fallback when `.job-title-v2` vanishes).
2. **Circuit-Breaker Failover Pipeline**: Implement automatic tier demotion: Primary HTTP Direct -> Residential Proxy Rotation -> Public RSS/Sitemap Fallback -> Cached Snapshot.

---

### 3. AI Tool Usage & Personal Verification

**Where AI Tools Were Used**:
- Drafting initial design tokens for CSS custom variables and modern color contrasts.
- Generating realistic JSON payload schema variations for job board data structures.

**What Was Personally Written & Verified Line-by-Line**:
- **Layout & Breakpoints**: Standardized responsive CSS rules ensuring zero horizontal scrolling across 390px mobile viewports up to 1440px desktop screens.
- **Konami Code State Machine**: Hand-coded key sequence listener (`↑ ↑ ↓ ↓ ← → ← → B A`) and custom HTML5 Canvas Matrix rain animation loop.
- **Dynamic Telemetry Chart**: Engineered the SVG path coordinate math (`pathD` and `areaD`) updating real-time latency curves in vanilla JS without external chart dependencies.
- **Honesty Constraint Audit**: Verified that zero fake testimonials, fake logos, or fake user stats were included in compliance with the prompt's signal-to-noise rules.
