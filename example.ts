#!/usr/bin/env bun

import { createApp, cors, logger, json } from './index.ts';

// Create app with configuration
const app = createApp({
  port: 3000,
  development: true,
  cors: {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Global middleware
app.use(logger());
app.use(cors());
app.use(json());

// Basic routes
app.get('/', (ctx) => {
  return ctx.json({ 
    message: 'Welcome to NinoTS!',
    framework: 'NinoTS',
    runtime: 'Bun',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (ctx) => {
  return ctx.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Route with parameters
app.get('/users/:id', (ctx) => {
  const { id } = ctx.params;
  return ctx.json({ 
    user: { 
      id, 
      name: `User ${id}`,
      email: `user${id}@example.com`
    }
  });
});

// Route with query parameters
app.get('/search', (ctx) => {
  const { q, limit = '10' } = ctx.query;
  return ctx.json({
    query: q,
    limit: parseInt(limit),
    results: q ? [`Result for "${q}"`] : []
  });
});

// POST route with body
app.post('/users', (ctx) => {
  const userData = ctx.body as Record<string, any>;
  return ctx
    .status(201)
    .json({
      message: 'User created',
      user: {
        id: Math.random().toString(36).substr(2, 9),
        ...userData,
        createdAt: new Date().toISOString()
      }
    });
});

// Error route for testing
app.get('/error', () => {
  throw new Error('This is a test error');
});

// 404 handling is automatic

// Error handling
app.onError((error, ctx) => {
  console.error('Application error:', error.message);
  
  return ctx
    .status(500)
    .json({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
});

// Start server
console.log('🚀 Starting NinoTS server...');
app.listen();
