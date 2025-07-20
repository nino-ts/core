/**
 * @fileoverview Core types and interfaces for NinoTS Framework
 * @module @ninots/core/types
 * @since 0.1.0
 */

/**
 * HTTP methods supported by NinoTS framework.
 *
 * @remarks
 * NinoTS supports all standard HTTP methods for RESTful API development.
 * Each method has specific semantic meaning according to HTTP specifications.
 *
 * @example
 * ```typescript
 * const method: HttpMethod = 'GET';
 * app.get('/users', handler); // Uses GET method
 * app.post('/users', handler); // Uses POST method
 * ```
 *
 * @public
 * @since 0.1.0
 */
export type HttpMethod =
	| "GET" /** Retrieve data from server */
	| "POST" /** Create new resource */
	| "PUT" /** Update/replace entire resource */
	| "DELETE" /** Remove resource */
	| "PATCH" /** Partial update of resource */
	| "HEAD" /** Retrieve headers only */
	| "OPTIONS" /** Get allowed methods/CORS preflight */;

/**
 * Route handler function signature for processing HTTP requests.
 *
 * @template T - The type of data returned by the handler
 *
 * @param context - The request context containing all request information
 * @returns Promise resolving to response data or direct response data
 *
 * @remarks
 * Route handlers can return any serializable data, which will be automatically
 * converted to JSON response, or return a Response object directly for full control.
 *
 * @example
 * ```typescript
 * // Simple JSON response
 * const handler: RouteHandler<{id: string}> = (ctx) => {
 *   return { id: ctx.params.id };
 * };
 *
 * // Custom Response object
 * const customHandler: RouteHandler = (ctx) => {
 *   return ctx.json({ message: 'Hello World' }, { status: 201 });
 * };
 *
 * // Async handler
 * const asyncHandler: RouteHandler = async (ctx) => {
 *   const data = await fetchFromDatabase(ctx.params.id);
 *   return data;
 * };
 * ```
 *
 * @public
 * @since 0.1.0
 */
export type RouteHandler<T = any> = (context: NinoContext) => Promise<T> | T;

/**
 * Middleware function signature for request/response processing pipeline.
 *
 * @param context - The request context containing all request information
 * @param next - Function to call the next middleware in the chain
 * @returns Promise resolving to void to continue, or Response to short-circuit
 *
 * @remarks
 * Middleware functions execute in order and can:
 * - Modify the request context
 * - Perform authentication/authorization
 * - Log requests
 * - Handle errors
 * - Return early responses
 *
 * @example
 * ```typescript
 * // Authentication middleware
 * const auth: Middleware = async (ctx, next) => {
 *   const token = ctx.headers.get('Authorization');
 *   if (!token) {
 *     return ctx.status(401).json({ error: 'Unauthorized' });
 *   }
 *   await next(); // Continue to next middleware/handler
 * };
 *
 * // Logging middleware
 * const logger: Middleware = async (ctx, next) => {
 *   console.log(`${ctx.method} ${ctx.url.pathname}`);
 *   await next();
 * };
 * ```
 *
 * @public
 * @since 0.1.0
 */
export type Middleware = (
	context: NinoContext,
	next: () => Promise<void>,
) => Promise<void | Response> | void | Response;

/**
 * Internal route definition structure used by the router.
 *
 * @remarks
 * This interface is used internally by the router to store route information.
 * Routes are created through the application methods (get, post, etc.) or decorators.
 *
 * @example
 * ```typescript
 * const route: Route = {
 *   method: 'GET',
 *   path: '/users/:id',
 *   handler: (ctx) => ({ userId: ctx.params.id }),
 *   middlewares: [authMiddleware, loggerMiddleware]
 * };
 * ```
 *
 * @public
 * @since 0.1.0
 */
export interface Route {
	/** HTTP method for this route */
	method: HttpMethod;
	/** URL path pattern (may include parameters like :id) */
	path: string;
	/** Function to handle requests to this route */
	handler: RouteHandler;
	/** Optional middleware stack for this specific route */
	middlewares?: Middleware[];
}

/**
 * Request context interface providing access to all request data and response helpers.
 *
 * @remarks
 * The NinoContext is the primary interface for accessing request data and creating responses.
 * It's inspired by Koa.js context but tailored for Bun and modern TypeScript development.
 * All route handlers and middleware receive this context as their first parameter.
 *
 * @example
 * ```typescript
 * app.get('/users/:id', (ctx: NinoContext) => {
 *   // Access route parameters
 *   const userId = ctx.params.id;
 *
 *   // Access query parameters
 *   const page = ctx.query.page || '1';
 *
 *   // Access request body (auto-parsed)
 *   const body = ctx.body;
 *
 *   // Create JSON response
 *   return ctx.json({ userId, page });
 * });
 *
 * app.post('/users', (ctx: NinoContext) => {
 *   // Access parsed body
 *   const userData = ctx.body as CreateUserData;
 *
 *   // Set custom headers and status
 *   return ctx
 *     .status(201)
 *     .header('Location', `/users/${newUser.id}`)
 *     .json(newUser);
 * });
 * ```
 *
 * @public
 * @since 0.1.0
 */
export interface NinoContext {
	/** Original Web API Request object */
	readonly request: Request;

	/** Parsed URL object with pathname, search params, etc. */
	readonly url: URL;

	/** HTTP method of the request */
	readonly method: HttpMethod;

	/** Request headers */
	readonly headers: Headers;

	/** Route parameters extracted from URL path (e.g., :id -> {id: "123"}) */
	readonly params: Record<string, string>;

	/** Query string parameters parsed from URL search params */
	readonly query: Record<string, string>;

	/** Request body automatically parsed based on Content-Type header */
	readonly body: unknown;

	/** Shared state object for passing data between middleware */
	readonly state: Record<string, any>;

	/**
	 * Create a JSON response.
	 *
	 * @param data - Data to serialize as JSON
	 * @param init - Optional ResponseInit for additional response configuration
	 * @returns Response object with JSON content-type
	 *
	 * @example
	 * ```typescript
	 * return ctx.json({ message: 'Success' });
	 * return ctx.json(users, { status: 200 });
	 * ```
	 */
	json(data: any, init?: ResponseInit): Response;

	/**
	 * Create a plain text response.
	 *
	 * @param text - Text content for the response
	 * @param init - Optional ResponseInit for additional response configuration
	 * @returns Response object with text/plain content-type
	 *
	 * @example
	 * ```typescript
	 * return ctx.text('Hello World');
	 * return ctx.text('Error occurred', { status: 500 });
	 * ```
	 */
	text(text: string, init?: ResponseInit): Response;

	/**
	 * Create an HTML response.
	 *
	 * @param html - HTML content for the response
	 * @param init - Optional ResponseInit for additional response configuration
	 * @returns Response object with text/html content-type
	 *
	 * @example
	 * ```typescript
	 * return ctx.html('<h1>Welcome</h1>');
	 * return ctx.html(renderTemplate(data));
	 * ```
	 */
	html(html: string, init?: ResponseInit): Response;

	/**
	 * Create a redirect response.
	 *
	 * @param url - URL to redirect to
	 * @param status - HTTP status code (default: 302)
	 * @returns Response object with Location header set
	 *
	 * @example
	 * ```typescript
	 * return ctx.redirect('/login');
	 * return ctx.redirect('https://example.com', 301);
	 * ```
	 */
	redirect(url: string, status?: number): Response;

	/**
	 * Set the response status code.
	 *
	 * @param code - HTTP status code
	 * @returns This context for method chaining
	 *
	 * @example
	 * ```typescript
	 * return ctx.status(201).json({ created: true });
	 * return ctx.status(404).text('Not Found');
	 * ```
	 */
	status(code: number): NinoContext;

	/**
	 * Set a response header.
	 *
	 * @param name - Header name
	 * @param value - Header value
	 * @returns This context for method chaining
	 *
	 * @example
	 * ```typescript
	 * return ctx
	 *   .header('X-Custom-Header', 'value')
	 *   .header('Cache-Control', 'no-cache')
	 *   .json(data);
	 * ```
	 */
	header(name: string, value: string): NinoContext;
}

/**
 * Configuration options for the NinoTS application.
 *
 * @remarks
 * These options control various aspects of the application behavior,
 * including server settings, development features, and CORS configuration.
 *
 * @example
 * ```typescript
 * const config: NinoConfig = {
 *   port: 3000,
 *   hostname: 'localhost',
 *   development: true,
 *   cors: {
 *     origin: ['https://example.com', 'https://app.example.com'],
 *     methods: ['GET', 'POST', 'PUT', 'DELETE'],
 *     credentials: true
 *   }
 * };
 *
 * const app = createApp(config);
 * ```
 *
 * @public
 * @since 0.1.0
 */
export interface NinoConfig {
	/**
	 * Port number for the server to listen on.
	 * @defaultValue 3000
	 */
	port?: number;

	/**
	 * Hostname for the server to bind to.
	 * @defaultValue 'localhost'
	 */
	hostname?: string;

	/**
	 * Enable development mode with enhanced error messages and debugging.
	 * @defaultValue true
	 */
	development?: boolean;

	/**
	 * CORS (Cross-Origin Resource Sharing) configuration.
	 * If provided, CORS middleware will be automatically applied.
	 */
	cors?: {
		/**
		 * Allowed origins. Can be:
		 * - true: Allow all origins (*)
		 * - string: Single allowed origin
		 * - string[]: Array of allowed origins
		 * - false: Disable CORS
		 */
		origin?: string | string[] | boolean;

		/** Allowed HTTP methods for CORS requests */
		methods?: HttpMethod[];

		/** Allowed headers for CORS requests */
		allowedHeaders?: string[];

		/** Whether to allow credentials in CORS requests */
		credentials?: boolean;
	};
}

/**
 * Error handler function signature for handling application errors.
 *
 * @param error - The error that occurred
 * @param context - The request context where the error occurred
 * @returns Promise resolving to a Response object or direct Response
 *
 * @remarks
 * Error handlers are called when unhandled errors occur in route handlers
 * or middleware. They should return appropriate error responses.
 *
 * @example
 * ```typescript
 * const errorHandler: ErrorHandler = (error, ctx) => {
 *   console.error('Application error:', error);
 *
 *   if (error instanceof ValidationError) {
 *     return ctx.status(400).json({
 *       error: 'Validation Error',
 *       details: error.details
 *     });
 *   }
 *
 *   return ctx.status(500).json({
 *     error: 'Internal Server Error',
 *     message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
 *   });
 * };
 *
 * app.onError(errorHandler);
 * ```
 *
 * @public
 * @since 0.1.0
 */
export type ErrorHandler = (
	error: Error,
	context: NinoContext,
) => Promise<Response> | Response;

/**
 * Configuration options for Router instances.
 *
 * @remarks
 * Routers can be configured with a path prefix and default middleware
 * that will be applied to all routes registered with the router.
 *
 * @example
 * ```typescript
 * const apiRouter = new Router({
 *   prefix: '/api/v1',
 *   middlewares: [authMiddleware, rateLimitMiddleware]
 * });
 *
 * // All routes will be prefixed with /api/v1
 * apiRouter.get('/users', getUsersHandler); // -> /api/v1/users
 * apiRouter.post('/users', createUserHandler); // -> /api/v1/users
 *
 * app.addRouter('', apiRouter);
 * ```
 *
 * @public
 * @since 0.1.0
 */
export interface RouterConfig {
	/**
	 * Path prefix to be prepended to all routes in this router.
	 * @example '/api/v1'
	 */
	prefix?: string;

	/**
	 * Default middleware to be applied to all routes in this router.
	 * These middleware will execute before route-specific middleware.
	 */
	middlewares?: Middleware[];
}
