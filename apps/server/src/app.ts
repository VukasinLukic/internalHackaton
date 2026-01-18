import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { neo4jConnection } from './infrastructure/database/neo4j/Neo4jConnection';
import { loadDomainConfig } from './config/domains';
import { registerRoutes } from './api/http/routes';
import { errorHandler } from './api/http/middleware';
import { socketManager } from './infrastructure/websocket';

dotenv.config();

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

// Load domain config
const domainConfig = loadDomainConfig();

// Make config available globally
app.decorate('domainConfig', domainConfig);

// Plugins
app.register(cors, { origin: true });

// Error handler
app.setErrorHandler(errorHandler);

// Root route - serve dashboard
app.get('/', async (_request, reply) => {
  const html = readFileSync(join(__dirname, '../public/index.html'), 'utf-8');
  reply.type('text/html').send(html);
});

// Routes
app.register(registerRoutes);

// Startup
const start = async () => {
  try {
    console.log('🔄 Starting server...');
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 Domain: ${domainConfig.type}`);

    // Connect to Neo4j
    console.log('🔌 Connecting to Neo4j...');
    await neo4jConnection.connect();
    console.log('✅ Neo4j connected');

    const port = Number(process.env.PORT) || 3000;
    console.log(`🚀 Starting Fastify on port ${port}...`);
    await app.listen({ port, host: '0.0.0.0' });
    console.log('✅ Fastify listening');

    // Initialize Socket.io with HTTP server
    console.log('🔌 Initializing Socket.io...');
    socketManager.initialize(app.server);
    console.log('✅ Socket.io initialized');

    console.log('');
    console.log('🚀 ZZZimeri API Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Domain: ${domainConfig.type}`);
    console.log(`🌐 Server: http://localhost:${port}`);
    console.log(`📚 API:    http://localhost:${port}/api/v1`);
    console.log(`💚 Health: http://localhost:${port}/api/v1/health`);
    console.log(`🔌 Socket: http://localhost:${port}/socket.io`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  } catch (err) {
    console.error('❌ Fatal error during startup:');
    console.error(err);
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await neo4jConnection.close();
  await app.close();
  process.exit(0);
});

start();
