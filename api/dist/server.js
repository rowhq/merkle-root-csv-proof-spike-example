"use strict";
/**
 * Fastify server setup and initialization
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildServer = buildServer;
exports.startServer = startServer;
const fastify_1 = __importDefault(require("fastify"));
const routes_1 = require("./routes");
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST = process.env.HOST || '127.0.0.1';
const BODY_LIMIT_MB = process.env.BODY_LIMIT_MB ? parseInt(process.env.BODY_LIMIT_MB) : 50;
async function buildServer() {
    const fastify = (0, fastify_1.default)({
        logger: process.env.NODE_ENV !== 'production',
        bodyLimit: BODY_LIMIT_MB * 1024 * 1024 // Convert MB to bytes
    });
    // Register Swagger
    await fastify.register(Promise.resolve().then(() => __importStar(require('@fastify/swagger'))), {
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
    await fastify.register(Promise.resolve().then(() => __importStar(require('@fastify/swagger-ui'))), {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'full',
            deepLinking: false
        }
    });
    // Register multipart for file uploads
    await fastify.register(Promise.resolve().then(() => __importStar(require('@fastify/multipart'))), {
        limits: {
            fileSize: BODY_LIMIT_MB * 1024 * 1024 // Set file size limit for multipart uploads
        }
    });
    // Register CORS if needed
    await fastify.register(Promise.resolve().then(() => __importStar(require('@fastify/cors'))), {
        origin: true
    });
    // Register routes
    await (0, routes_1.registerRoutes)(fastify);
    return fastify;
}
async function startServer() {
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
    }
    catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}
// Start server if this file is run directly
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=server.js.map