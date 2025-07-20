/**
 * @fileoverview Main application class and factory for NinoTS Framework
 * @module @ninots/core/app
 * @since 0.1.0
 */

import type { 
  HttpMethod, 
  NinoConfig, 
  Middleware, 
  RouteHandler, 
  ErrorHandler,
  Route
} from './types';
import { Context } from './context';
import { Router } from './router';

/**
 * Main NinoTS Application class that orchestrates routing, middleware, and server functionality.
 * 
 * @remarks
 * The NinoApp class is the core of the NinoTS framework, providing:
 * - HTTP method routing (GET, POST, PUT, DELETE, etc.)
 * - Global and route-specific middleware support
 * - Error handling and 404 responses
 * - Server configuration and startup
 * - Router composition and sub-routing
 * 
 * The application uses Bun's native HTTP server for optimal performance
 * and integrates seamlessly with the Web APIs (Request/Response).
 * 
 * @example
 * ```typescript
 * // Create a new application
 * const app = new NinoApp({
 *   port: 3000,
 *   hostname: 'localhost',
 *   development: true
 * });
 * 
 * // Add global middleware
 * app.use(logger());
 * app.use(cors());
 * 
 * // Define routes
 * app.get('/api/users', async (ctx) => {
 *   return ctx.json({ users: [] });
 * });
 * 
 * // Error handling
 * app.onError((error, ctx) => {
 *   console.error('Application error:', error);
 *   return ctx.status(500).json({ error: 'Internal server error' });
 * });
 * 
 * // Start server
 * app.listen();
 * ```
 * 
 * @public
 * @since 0.1.0
 */
export class NinoApp {
  /** Internal router instance for handling routes */
  private appRouter = new Router();
  
  /** Array of global middlewares applied to all routes */
  private globalMiddlewares: Middleware[] = [];
  
  /** Global error handler function */
  private errorHandler?: ErrorHandler;
  
  /** Application configuration */
  private config: NinoConfig;

  /**
   * Creates a new NinoTS application instance.
   * 
   * @param config - Configuration options for the application
   * 
   * @example
   * ```typescript
   * // Basic application
   * const app = new NinoApp();
   * 
   * // With custom configuration
   * const app = new NinoApp({
   *   port: 8080,
   *   hostname: '0.0.0.0',
   *   development: false
   * });
   * ```
   */
  constructor(config: NinoConfig = {}) {
    this.config = {
      port: 3000,
      hostname: 'localhost',
      development: true,
      ...config
    };
  }

  /**
   * Adds global middleware that will be executed for all routes.
   * 
   * @param middleware - Middleware function to add to the global chain
   * @returns The application instance for method chaining
   * 
   * @remarks
   * Global middlewares are executed in the order they are added, before
   * any route-specific middlewares. They apply to all HTTP methods and paths.
   * 
   * @example
   * ```typescript
   * app.use(logger())
   *    .use(cors())
   *    .use(json())
   *    .use(errorHandler());
   * ```
   * 
   * @public
   * @since 0.1.0
   */
  use(middleware: Middleware): NinoApp {
    this.globalMiddlewares.push(middleware);
    return this;
  }

  /**
   * Sets a global error handler for the application.
   * 
   * @param handler - Error handler function
   * @returns The application instance for method chaining
   * 
   * @remarks
   * The error handler will be called for any unhandled errors that occur
   * during request processing. It should return a Response object or a
   * value that can be converted to JSON.
   * 
   * @example
   * ```typescript
   * app.onError((error, context) => {
   *   console.error('Application error:', error);
   *   
   *   if (error.name === 'ValidationError') {
   *     return context.status(400).json({
   *       error: 'Validation Error',
   *       details: error.message
   *     });
   *   }
   *   
   *   return context.status(500).json({
   *     error: 'Internal Server Error'
   *   });
   * });
   * ```
   * 
   * @public
   * @since 0.1.0
   */
  onError(handler: ErrorHandler): NinoApp {
    this.errorHandler = handler;
    return this;
  }

  /**
   * Mounts a sub-router at the specified path prefix.
   * 
   * @param path - Path prefix for the router (e.g., '/api', '/admin')
   * @param router - Router instance to mount
   * @returns The application instance for method chaining
   * 
   * @remarks
   * This method allows for modular routing by composing multiple routers.
   * All routes from the mounted router will be prefixed with the specified path.
   * 
   * @example
   * ```typescript
   * const apiRouter = new Router();
   * apiRouter.get('/users', getUsersHandler);
   * apiRouter.post('/users', createUserHandler);
   * 
   * const adminRouter = new Router();
   * adminRouter.get('/dashboard', dashboardHandler);
   * 
   * app.addRouter('/api', apiRouter);    // Routes: /api/users
   * app.addRouter('/admin', adminRouter); // Routes: /admin/dashboard
   * ```
   * 
   * @public
   * @since 0.1.0
   */
  addRouter(path: string, router: Router): NinoApp {
    const routes = router.getRoutes();
    routes.forEach(route => {
      // Create a new route with the path prefix
      const newRoute: Route = {
        method: route.method,
        path: path + route.path,
        handler: route.handler,
        middlewares: route.middlewares
      };
      this.appRouter.getRoutes().push(newRoute);
    });
    return this;
  }

  // HTTP Methods
  
  /**
   * Registers a GET route handler.
   * 
   * @param path - URL path pattern (supports parameters like '/users/:id')
   * @param handler - Route handler function
   * @param middlewares - Optional route-specific middlewares
   * @returns The application instance for method chaining
   * 
   * @example
   * ```typescript
   * app.get('/users/:id', async (ctx) => {
   *   const userId = ctx.params.id;
   *   return ctx.json({ id: userId });
   * });
   * ```
   * 
   * @public
   * @since 0.1.0
   */
  get(path: string, handler: RouteHandler, ...middlewares: Middleware[]): NinoApp {
    this.appRouter.get(path, handler, ...middlewares);
    return this;
  }

  /**
   * Registers a POST route handler.
   * 
   * @param path - URL path pattern (supports parameters like '/users/:id')
   * @param handler - Route handler function
   * @param middlewares - Optional route-specific middlewares
   * @returns The application instance for method chaining
   * 
   * @example
   * ```typescript
   * app.post('/users', async (ctx) => {
   *   const userData = await ctx.body;
   *   return ctx.json({ created: userData });
   * });
   * ```
   * 
   * @public
   * @since 0.1.0
   */
  post(path: string, handler: RouteHandler, ...middlewares: Middleware[]): NinoApp {
    this.appRouter.post(path, handler, ...middlewares);
    return this;
  }

  /**
   * Registers a PUT route handler.
   * 
   * @param path - URL path pattern (supports parameters like '/users/:id')
   * @param handler - Route handler function
   * @param middlewares - Optional route-specific middlewares
   * @returns The application instance for method chaining
   * 
   * @example
   * ```typescript
   * app.put('/users/:id', async (ctx) => {
   *   const userId = ctx.params.id;
   *   const userData = await ctx.body;
   *   return ctx.json({ id: userId, updated: userData });
   * });
   * ```
   * 
   * @public
   * @since 0.1.0
   */
  put(path: string, handler: RouteHandler, ...middlewares: Middleware[]): NinoApp {
    this.appRouter.put(path, handler, ...middlewares);
    return this;
  }

  /**
   * Registers a DELETE route handler.
   * 
   * @param path - URL path pattern (supports parameters like '/users/:id')
   * @param handler - Route handler function
   * @param middlewares - Optional route-specific middlewares
   * @returns The application instance for method chaining
   * 
   * @example
   * ```typescript
   * app.delete('/users/:id', async (ctx) => {
   *   const userId = ctx.params.id;
   *   return ctx.json({ deleted: userId });
   * });
   * ```
   * 
   * @public
   * @since 0.1.0
   */
  delete(path: string, handler: RouteHandler, ...middlewares: Middleware[]): NinoApp {
    this.appRouter.delete(path, handler, ...middlewares);
    return this;
  }

  /**
   * Registers a PATCH route handler.
   * 
   * @param path - URL path pattern (supports parameters like '/users/:id')
   * @param handler - Route handler function
   * @param middlewares - Optional route-specific middlewares
   * @returns The application instance for method chaining
   * 
   * @example
   * ```typescript
   * app.patch('/users/:id', async (ctx) => {
   *   const userId = ctx.params.id;
   *   const updates = await ctx.body;
   *   return ctx.json({ id: userId, patched: updates });
   * });
   * ```
   * 
   * @public
   * @since 0.1.0
   */
  patch(path: string, handler: RouteHandler, ...middlewares: Middleware[]): NinoApp {
    this.appRouter.patch(path, handler, ...middlewares);
    return this;
  }

  /**
   * Registers a HEAD route handler.
   * 
   * @param path - URL path pattern (supports parameters like '/users/:id')
   * @param handler - Route handler function
   * @param middlewares - Optional route-specific middlewares
   * @returns The application instance for method chaining
   * 
   * @example
   * ```typescript
   * app.head('/users/:id', async (ctx) => {
   *   const userId = ctx.params.id;
   *   return ctx.status(200).text('');
   * });
   * ```
   * 
   * @public
   * @since 0.1.0
   */
  head(path: string, handler: RouteHandler, ...middlewares: Middleware[]): NinoApp {
    this.appRouter.head(path, handler, ...middlewares);
    return this;
  }

  /**
   * Registers an OPTIONS route handler.
   * 
   * @param path - URL path pattern (supports parameters like '/users/:id')
   * @param handler - Route handler function
   * @param middlewares - Optional route-specific middlewares
   * @returns The application instance for method chaining
   * 
   * @example
   * ```typescript
   * app.options('/api/*', async (ctx) => {
   *   return ctx.status(204)
   *     .header('Allow', 'GET,POST,PUT,DELETE')
   *     .text('');
   * });
   * ```
   * 
   * @public
   * @since 0.1.0
   */
  options(path: string, handler: RouteHandler, ...middlewares: Middleware[]): NinoApp {
    this.appRouter.options(path, handler, ...middlewares);
    return this;
  }

  /**
   * Handles incoming HTTP requests by routing them through the middleware chain.
   * 
   * @param request - Incoming HTTP request
   * @returns Promise resolving to HTTP response
   * 
   * @remarks
   * This is the main request handler that:
   * 1. Creates a context from the request
   * 2. Finds the matching route
   * 3. Executes the middleware chain
   * 4. Handles errors and 404s
   * 
   * @private
   * @since 0.1.0
   */
  private async handleRequest(request: Request): Promise<Response> {
    const context = new Context(request);
    
    try {
      // Find matching route
      const match = this.appRouter.findRoute(context.method, context.url.pathname);
      
      if (!match) {
        return this.handleNotFound(context);
      }

      // Set route parameters
      Object.assign(context.params, match.params);

      // Create middleware chain
      const middlewares = [
        ...this.globalMiddlewares,
        ...(match.route.middlewares || [])
      ];

      // Execute middleware chain
      const response = await this.executeMiddlewareChain(
        context, 
        middlewares, 
        match.route.handler
      );

      return response || new Response('No response generated', { status: 500 });

    } catch (error) {
      return await this.handleError(error, context);
    }
  }

  /**
   * Executes the middleware chain followed by the route handler.
   * 
   * @param context - Request context
   * @param middlewares - Array of middleware functions to execute
   * @param handler - Final route handler function
   * @returns Promise resolving to HTTP response
   * 
   * @remarks
   * Middlewares are executed in order, each calling `next()` to proceed.
   * The route handler is executed after all middlewares complete.
   * Any middleware can return a Response to short-circuit the chain.
   * 
   * @private
   * @since 0.1.0
   */
  private async executeMiddlewareChain(
    context: Context,
    middlewares: Middleware[],
    handler: RouteHandler
  ): Promise<Response> {
    let index = 0;
    let response: Response | undefined;

    const next = async (): Promise<void> => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        if (middleware) {
          const result = await middleware(context, next);
          
          if (result instanceof Response) {
            response = result;
          }
        }
      } else {
        // Execute route handler
        const result = await handler(context);
        
        if (result instanceof Response) {
          response = result;
        } else if (result !== undefined) {
          response = context.json(result);
        }
      }
    };

    await next();
    
    return response || new Response('No response generated', { status: 500 });
  }

  /**
   * Handles 404 Not Found responses.
   * 
   * @param context - Request context
   * @returns Response with 404 status and error message
   * 
   * @private
   * @since 0.1.0
   */
  private handleNotFound(context: Context): Response {
    return context
      .status(404)
      .json({
        error: 'Not Found',
        message: `Route ${context.method} ${context.url.pathname} not found`
      });
  }

  /**
   * Handles application errors with optional custom error handler.
   * 
   * @param error - Error that occurred during request processing
   * @param context - Request context
   * @returns Promise resolving to error response
   * 
   * @remarks
   * If a custom error handler is set, it will be called first.
   * Falls back to default error handling if the custom handler fails.
   * In development mode, stack traces are included in the response.
   * 
   * @private
   * @since 0.1.0
   */
  private async handleError(error: unknown, context: Context): Promise<Response> {
    if (this.errorHandler && error instanceof Error) {
      try {
        const result = this.errorHandler(error, context);
        return result instanceof Promise ? await result : result;
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    }

    console.error('Unhandled error:', error);

    return context
      .status(500)
      .json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        ...(this.config.development && error instanceof Error && { stack: error.stack })
      });
  }

  /**
   * Starts the HTTP server and begins listening for requests.
   * 
   * @param port - Port number to listen on (overrides config)
   * @param hostname - Hostname to bind to (overrides config)
   * 
   * @remarks
   * This method starts the Bun HTTP server with the specified configuration.
   * The server will handle all incoming requests through the application's
   * routing and middleware system.
   * 
   * @example
   * ```typescript
   * // Use default config
   * app.listen();
   * 
   * // Override port
   * app.listen(8080);
   * 
   * // Override both port and hostname
   * app.listen(3000, '0.0.0.0');
   * ```
   * 
   * @public
   * @since 0.1.0
   */
  listen(port?: number, hostname?: string): void {
    const serverPort = port || this.config.port || 3000;
    const serverHostname = hostname || this.config.hostname || 'localhost';

    const server = Bun.serve({
      port: serverPort,
      hostname: serverHostname,
      fetch: (request) => this.handleRequest(request),
    });

    console.log(`🚀 NinoTS server running on http://${server.hostname}:${server.port}`);
  }

  /**
   * Creates a new router instance.
   * 
   * @returns New Router instance
   * 
   * @remarks
   * This is a convenience static method for creating router instances
   * that can be used with `addRouter()` for modular routing.
   * 
   * @example
   * ```typescript
   * const apiRouter = NinoApp.Router();
   * apiRouter.get('/users', getUsersHandler);
   * app.addRouter('/api', apiRouter);
   * ```
   * 
   * @public
   * @since 0.1.0
   */
  static Router(): Router {
    return new Router();
  }
}

/**
 * Factory function to create a new NinoTS application instance.
 * 
 * @param config - Optional configuration for the application
 * @returns New NinoApp instance
 * 
 * @remarks
 * This is a convenience factory function that provides an alternative
 * to using the `new NinoApp()` constructor. Both approaches are equivalent.
 * 
 * @example
 * ```typescript
 * // Using factory function
 * const app = createApp({
 *   port: 3000,
 *   development: true
 * });
 * 
 * // Equivalent to:
 * const app = new NinoApp({
 *   port: 3000,
 *   development: true
 * });
 * ```
 * 
 * @public
 * @since 0.1.0
 */
export function createApp(config?: NinoConfig): NinoApp {
  return new NinoApp(config);
}
