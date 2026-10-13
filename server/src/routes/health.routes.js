import express from 'express';
import mongoose from 'mongoose';
import { config } from '../config/env.js';

const router = express.Router();

router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'][dbState] || 'Unknown';

  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GreenProof AI Backend',
    version: '1.0.0',
    database: {
      status: dbStatus,
      connected: dbState === 1,
    },
    geminiConfigured: Boolean(config.geminiApiKey),
    environment: config.nodeEnv,
  });
});

export default router;
