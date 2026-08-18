import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { IngestionPipeline } from './scraper/pipeline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const pipeline = new IngestionPipeline();

// API Endpoint: Trigger live ingestion run
app.get('/api/scrape', async (req, res) => {
  try {
    const result = await pipeline.runIngestion({
      meanDelay: req.query.pacing === 'fast' ? 400 : 800
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Ingestion pipeline execution failed',
      message: error.message
    });
  }
});

// API Endpoint: Retrieve real-time telemetry logs & stats
app.get('/api/telemetry', (_req, res) => {
  res.json(pipeline.getTelemetry());
});

// API Endpoint: Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'HyperFetch Resilient Data Ingestion Pipeline (Part 1 & Part 2)',
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 HyperFetch Pipeline & Telemetry Workbench running on http://localhost:${PORT}`);
});
