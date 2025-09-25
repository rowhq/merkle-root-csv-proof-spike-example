/**
 * Fastify server setup and initialization
 */

import Fastify from 'fastify';
import { registerRoutes } from './routes';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST = process.env.HOST || '127.0.0.1';
const BODY_LIMIT_MB = process.env.BODY_LIMIT_MB ? parseInt(process.env.BODY_LIMIT_MB) : 50;

export async function buildServer() {
  const fastify = Fastify({
    logger: process.env.NODE_ENV !== 'production',
    bodyLimit: BODY_LIMIT_MB * 1024 * 1024 // Convert MB to bytes
  });

  // Register Swagger
  await fastify.register(import('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'Merkle Tree API',
        description: 'API for generating Merkle trees and proofs',
        version: '1.0.0'
      },
      host: `${HOST}:${PORT}`,
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'tree', description: 'Merkle tree operations' }
      ]
    }
  });

  await fastify.register(import('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    }
  });

  // Register multipart for file uploads
  await fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: BODY_LIMIT_MB * 1024 * 1024 // Set file size limit for multipart uploads
    }
  });

  // Register CORS if needed
  await fastify.register(import('@fastify/cors'), {
    origin: true
  });

  // Register routes
  await registerRoutes(fastify);

  return fastify;
}

export async function startServer() {
  try {
    const fastify = await buildServer();

    await fastify.listen({
      port: PORT,
      host: HOST
    });

    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
    console.log(`📖 Swagger docs: http://${HOST}:${PORT}/docs`);
    console.log(`🌳 Generate tree: POST http://${HOST}:${PORT}/api/generate-tree`);

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}