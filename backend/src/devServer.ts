// backend/src/index.ts
import { app } from './app';

import { createServer } from 'http';
import { setupSocketIO } from './lib/socket';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

const server = createServer(app);

// Setup Socket.io for real-time features
setupSocketIO(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});
