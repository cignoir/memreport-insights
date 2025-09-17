#!/usr/bin/env node

import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import open from 'open';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

async function startServer() {
  const server = await createServer({
    root,
    server: {
      port: 8173,
      open: true,
    },
  });

  await server.listen();

  console.log('\n🚀 MemReport Insights is running!');
  console.log(`📊 Open your browser at: http://localhost:8173`);
  console.log('\n📁 Drag and drop your .memreport file to analyze');
  console.log('Press Ctrl+C to stop the server\n');
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});