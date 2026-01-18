console.log('🚀 [STARTUP] Initializing ZZZimeri Server...');
console.log('🚀 [STARTUP] Node version:', process.version);
console.log('🚀 [STARTUP] Working directory:', process.cwd());

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

console.log('✅ [STARTUP] All imports loaded');

console.log('🔧 [CONFIG] Loading .env file...');
dotenv.config();
console.log('✅ [CONFIG] Environment variables loaded');
console.log('📝 [CONFIG] NODE_ENV:', process.env.NODE_ENV);
console.log('📝 [CONFIG] PORT:', process.env.PORT);
console.log('📝 [CONFIG] DOMAIN_TYPE:', process.env.DOMAIN_TYPE);

console.log('🔧 [FASTIFY] Creating Fastify instance...');
const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});
console.log('✅ [FASTIFY] Fastify instance created');

// Load domain config
console.log('🔧 [DOMAIN] Loading domain config...');
const domainConfig = loadDomainConfig();
console.log('✅ [DOMAIN] Domain config loaded:', domainConfig.type);

// Make config available globally
console.log('🔧 [FASTIFY] Decorating app with domainConfig...');
app.decorate('domainConfig', domainConfig);

// Plugins
console.log('🔧 [CORS] Registering CORS plugin...');
app.register(cors, { origin: true });
console.log('✅ [CORS] CORS registered');

// Error handler
console.log('🔧 [ERROR] Setting error handler...');
app.setErrorHandler(errorHandler);
console.log('✅ [ERROR] Error handler set');

// Root route - serve dashboard
console.log('🔧 [ROUTES] Registering root route...');
app.get('/', async (_request, reply) => {
  const html = readFileSync(join(__dirname, '../public/index.html'), 'utf-8');
  reply.type('text/html').send(html);
});
console.log('✅ [ROUTES] Root route registered');

// Routes
console.log('🔧 [ROUTES] Registering API routes...');
app.register(registerRoutes);
console.log('✅ [ROUTES] API routes registered');

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
  console.log('\n🛑 [SHUTDOWN] Received SIGINT, shutting down gracefully...');
  await neo4jConnection.close();
  await app.close();
  console.log('✅ [SHUTDOWN] Server closed');
  process.exit(0);
});

console.log('🔧 [MAIN] Calling start() function...');
start().catch((err) => {
  console.error('❌ [MAIN] Fatal error in start():');
  console.error(err);
  process.exit(1);
});
