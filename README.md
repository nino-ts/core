# NinoTS Core

🚀 Modern TypeScript backend framework designed exclusively for Bun runtime.

## Features

- **🔥 Bun Native** - Built specifically for Bun, no Node.js support
- **⚡ TypeScript First** - 100% TypeScript, no JavaScript support
- **🛣️ Fast Routing** - Efficient path matching with parameter extraction
- **🔧 Middleware System** - Composable middleware chain
- **🎯 Decorators** - Clean controller-based routing with decorators
- **📦 Modern APIs** - Uses Web APIs (Request, Response, URL)
- **🔒 Type Safe** - Full TypeScript type safety throughout

## Installation

```bash
# Using JSR (recommended)
bunx jsr add @ninots/core

# Or using Bun directly
bun add @ninots/core
```

## Quick Start

### Basic App

```typescript
import { createApp } from '@ninots/core';

const app = createApp({
  port: 3000,
  development: true
});

app.get('/', (ctx) => {
  return ctx.json({ message: 'Hello, NinoTS!' });
});

app.get('/users/:id', (ctx) => {
  const { id } = ctx.params;
  return ctx.json({ userId: id });
});

app.listen();
```

### Using Middleware

```typescript
import { createApp, cors, logger, json } from '@ninots/core';

const app = createApp();

// Global middleware
app.use(logger());
app.use(cors());
app.use(json());

app.post('/api/users', (ctx) => {
  const userData = ctx.body;
  return ctx.status(201).json({ created: userData });
});

app.listen(3000);
```

### Controller-based Routing

```typescript
import { Controller, Get, Post, Body, Param } from '@ninots/core';

@Controller('/api/users')
class UserController {
  @Get('/')
  async getUsers() {
    return { users: [] };
  }

  @Get('/:id')
  async getUser(@Param('id') id: string) {
    return { user: { id } };
  }

  @Post('/')
  async createUser(@Body() userData: any) {
    return { created: userData };
  }
}
```

### Error Handling

```typescript
import { createApp, errorHandler } from '@ninots/core';

const app = createApp();

app.use(errorHandler());

app.onError((error, ctx) => {
  console.error('Custom error handler:', error);
  return ctx.status(500).json({
    error: 'Something went wrong!',
    message: error.message
  });
});

app.get('/error', () => {
  throw new Error('This is a test error');
});

app.listen();
```

## API Reference

### Application

- `createApp(config?)` - Create new NinoTS application
- `app.use(middleware)` - Add global middleware
- `app.get/post/put/delete/patch/head/options(path, handler, ...middlewares)` - Define routes
- `app.listen(port?, hostname?)` - Start server
- `app.onError(handler)` - Set error handler

### Context

- `ctx.request` - Original Request object
- `ctx.url` - Parsed URL object
- `ctx.method` - HTTP method
- `ctx.headers` - Request headers
- `ctx.params` - Route parameters
- `ctx.query` - Query parameters
- `ctx.body` - Request body (auto-parsed)
- `ctx.json(data, init?)` - JSON response
- `ctx.text(text, init?)` - Text response
- `ctx.html(html, init?)` - HTML response
- `ctx.redirect(url, status?)` - Redirect response
- `ctx.status(code)` - Set status code
- `ctx.header(name, value)` - Set response header

### Built-in Middleware

- `cors(options?)` - CORS support
- `logger()` - Request logging
- `json()` - JSON body parsing
- `errorHandler()` - Error handling
- `rateLimit(options?)` - Rate limiting
- `staticFiles(directory)` - Static file serving

### Decorators

- `@Controller(basePath?)` - Define controller class
- `@Get/@Post/@Put/@Delete/@Patch/@Head/@Options(path)` - HTTP methods
- `@UseMiddleware(...middlewares)` - Apply middleware to route
- `@Body()` - Inject request body
- `@Param(key)` - Inject route parameter
- `@Query(key?)` - Inject query parameter
- `@Ctx()` - Inject full context

### Utilities

- `HttpStatus` - HTTP status code constants
- `MimeType` - MIME type constants
- `env` - Environment variable helpers
- `validate` - Validation utilities
- `async` - Async utilities (sleep, timeout, retry)
- `object` - Object manipulation utilities
- `string` - String transformation utilities

## License

MIT

