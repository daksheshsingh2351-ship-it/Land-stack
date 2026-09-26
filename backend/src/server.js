import app from './app.js';
import config from './config/index.js';

const start = () => {
  app.listen(config.port, () => {
    console.log(`\n  ┌─────────────────────────────────────────┐`);
    console.log(`  │  LandStack Backend                      │`);
    console.log(`  │  Running on http://localhost:${config.port}      │`);
    console.log(`  │  Environment: ${config.nodeEnv.padEnd(24)}│`);
    console.log(`  └─────────────────────────────────────────┘\n`);
  });
};

start();
