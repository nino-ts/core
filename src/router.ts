/**
 * @fileoverview Router implementation for NinoTS Framework
 * @module @ninots/core/router
 * @since 0.1.0
 */

import type {
	HttpMethod,
	Middleware,
	Route,
	RouteHandler,
	RouterConfig,
} from "./types";

/**
 * Internal interface for path pattern matching with regex and parameter extraction.
 *
 * @internal
 * @since 0.1.0
 */
interface PathPattern {
	/** Regular expression pattern for matching URL paths */
	pattern: RegExp;
	/** Array of parameter names extracted from the path pattern */
	keys: string[];
}

/**
 * Router class for handling HTTP routes and middleware in NinoTS applications.
 *
 * @remarks
 * The Router class provides a flexible way to define routes with support for:
 * - Path parameters (e.g., `/users/:id`)
 * - Middleware stacks per router
 * - Path prefixes for route grouping
 * - All standard HTTP methods
 *
 * Routers can be used standalone or combined with the main application.
 * They support method chaining for fluent API design.
 *
 * @example
 * ```typescript
 * // Create a router with configuration
 * const apiRouter = new Router({
 *   prefix: '/api/v1',
 *   middlewares: [authMiddleware, loggingMiddleware]
 * });
 *
 * // Add routes with method chaining
 * apiRouter
 *   .get('/users', getAllUsers)
 *   .get('/users/:id', getUserById)
 *   .post('/users', createUser, validationMiddleware)
 *   .put('/users/:id', updateUser)
 *   .delete('/users/:id', deleteUser);
 *
 * // Use with main application
 * app.addRouter('', apiRouter);
 * ```
 *
 * @public
 * @since 0.1.0
 */
export class Router {
	/** Array of registered routes */
	private routes: Route[] = [];

	/** Middleware stack applied to all routes in this router */
	private middlewares: Middleware[] = [];

	/** Path prefix prepended to all routes */
	private prefix: string;

	/**
	 * Creates a new Router instance with optional configuration.
	 *
	 * @param config - Configuration options for the router
	 *
	 * @example
	 * ```typescript
	 * // Basic router
	 * const router = new Router();
	 *
	 * // Router with prefix and middleware
	 * const apiRouter = new Router({
	 *   prefix: '/api/v1',
	 *   middlewares: [authMiddleware, rateLimitMiddleware]
	 * });
	 * ```
	 *
	 * @since 0.1.0
	 */
	constructor(config: RouterConfig = {}) {
		this.prefix = config.prefix || "";
		this.middlewares = config.middlewares || [];
	}

	/**
	 * Adds middleware to this router that will be applied to all routes.
	 *
	 * @param middleware - Middleware function to add
	 * @returns This router instance for method chaining
	 *
	 * @remarks
	 * Middleware added with `use()` will execute before route-specific middleware
	 * and the route handler. Multiple middleware can be added and will execute
	 * in the order they were added.
	 *
	 * @example
	 * ```typescript
	 * router
	 *   .use(authMiddleware)
	 *   .use(loggingMiddleware)
	 *   .use(validationMiddleware);
	 *
	 * // All routes will now use these middleware
	 * router.get('/protected', handler);
	 * ```
	 *
	 * @since 0.1.0
	 */
	use(middleware: Middleware): Router {
		this.middlewares.push(middleware);
		return this;
	}

	/**
	 * Internal method to add a route with the specified HTTP method.
	 *
	 * @private
	 * @param method - HTTP method for the route
	 * @param path - URL path pattern (may include parameters)
	 * @param handler - Function to handle requests to this route
	 * @param middlewares - Optional middleware specific to this route
	 * @returns This router instance for method chaining
	 *
	 * @remarks
	 * This method combines the router's prefix with the provided path,
	 * merges router-level middleware with route-specific middleware,
	 * and adds the complete route definition to the routes array.
	 *
	 * @since 0.1.0
	 */
	private addRoute(
		method: HttpMethod,
		path: string,
		handler: RouteHandler,
		middlewares: Middleware[] = [],
	): Router {
		const fullPath = this.prefix + path;
		this.routes.push({
			method,
			path: fullPath,
			handler,
			middlewares: [...this.middlewares, ...middlewares],
		});
		return this;
	}

	/**
	 * Registers a GET route handler.
	 *
	 * @param path - URL path pattern (supports parameters like `:id`)
	 * @param handler - Function to handle GET requests
	 * @param middlewares - Optional middleware for this specific route
	 * @returns This router instance for method chaining
	 *
	 * @example
	 * ```typescript
	 * // Simple GET route
	 * router.get('/users', (ctx) => ctx.json(users));
	 *
	 * // GET route with parameters
	 * router.get('/users/:id', (ctx) => {
	 *   const userId = ctx.params.id;
	 *   return ctx.json(getUserById(userId));
	 * });
	 *
	 * // GET route with middleware
	 * router.get('/protected', protectedHandler, authMiddleware, rateLimitMiddleware);
	 * ```
	 *
	 * @since 0.1.0
	 */
	get(
		path: string,
		handler: RouteHandler,
		...middlewares: Middleware[]
	): Router {
		return this.addRoute("GET", path, handler, middlewares);
	}

	/**
	 * Registers a POST route handler.
	 *
	 * @param path - URL path pattern (supports parameters like `:id`)
	 * @param handler - Function to handle POST requests
	 * @param middlewares - Optional middleware for this specific route
	 * @returns This router instance for method chaining
	 *
	 * @example
	 * ```typescript
	 * // Simple POST route
	 * router.post('/users', (ctx) => {
	 *   const userData = ctx.body as CreateUserData;
	 *   const newUser = createUser(userData);
	 *   return ctx.status(201).json(newUser);
	 * });
	 *
	 * // POST route with validation middleware
	 * router.post('/users', createUserHandler, validateUserData, sanitizeInput);
	 * ```
	 *
	 * @since 0.1.0
	 */
	post(
		path: string,
		handler: RouteHandler,
		...middlewares: Middleware[]
	): Router {
		return this.addRoute("POST", path, handler, middlewares);
	}

	/**
	 * Registers a PUT route handler.
	 *
	 * @param path - URL path pattern (supports parameters like `:id`)
	 * @param handler - Function to handle PUT requests
	 * @param middlewares - Optional middleware for this specific route
	 * @returns This router instance for method chaining
	 *
	 * @example
	 * ```typescript
	 * // Update entire resource
	 * router.put('/users/:id', (ctx) => {
	 *   const userId = ctx.params.id;
	 *   const userData = ctx.body as UpdateUserData;
	 *   const updatedUser = updateUser(userId, userData);
	 *   return ctx.json(updatedUser);
	 * });
	 * ```
	 *
	 * @since 0.1.0
	 */
	put(
		path: string,
		handler: RouteHandler,
		...middlewares: Middleware[]
	): Router {
		return this.addRoute("PUT", path, handler, middlewares);
	}

	/**
	 * Registers a DELETE route handler.
	 *
	 * @param path - URL path pattern (supports parameters like `:id`)
	 * @param handler - Function to handle DELETE requests
	 * @param middlewares - Optional middleware for this specific route
	 * @returns This router instance for method chaining
	 *
	 * @example
	 * ```typescript
	 * // Delete resource
	 * router.delete('/users/:id', (ctx) => {
	 *   const userId = ctx.params.id;
	 *   deleteUser(userId);
	 *   return ctx.status(204).text('');
	 * });
	 * ```
	 *
	 * @since 0.1.0
	 */
	delete(
		path: string,
		handler: RouteHandler,
		...middlewares: Middleware[]
	): Router {
		return this.addRoute("DELETE", path, handler, middlewares);
	}

	/**
	 * Registers a PATCH route handler.
	 *
	 * @param path - URL path pattern (supports parameters like `:id`)
	 * @param handler - Function to handle PATCH requests
	 * @param middlewares - Optional middleware for this specific route
	 * @returns This router instance for method chaining
	 *
	 * @example
	 * ```typescript
	 * // Partial update
	 * router.patch('/users/:id', (ctx) => {
	 *   const userId = ctx.params.id;
	 *   const partialData = ctx.body as Partial<UserData>;
	 *   const updatedUser = patchUser(userId, partialData);
	 *   return ctx.json(updatedUser);
	 * });
	 * ```
	 *
	 * @since 0.1.0
	 */
	patch(
		path: string,
		handler: RouteHandler,
		...middlewares: Middleware[]
	): Router {
		return this.addRoute("PATCH", path, handler, middlewares);
	}

	/**
	 * Registers a HEAD route handler.
	 *
	 * @param path - URL path pattern (supports parameters like `:id`)
	 * @param handler - Function to handle HEAD requests
	 * @param middlewares - Optional middleware for this specific route
	 * @returns This router instance for method chaining
	 *
	 * @remarks
	 * HEAD requests are identical to GET requests except that the server
	 * must not return a response body. Useful for checking if a resource exists.
	 *
	 * @example
	 * ```typescript
	 * // Check if resource exists
	 * router.head('/users/:id', (ctx) => {
	 *   const userId = ctx.params.id;
	 *   const userExists = checkUserExists(userId);
	 *   return ctx.status(userExists ? 200 : 404).text('');
	 * });
	 * ```
	 *
	 * @since 0.1.0
	 */
	head(
		path: string,
		handler: RouteHandler,
		...middlewares: Middleware[]
	): Router {
		return this.addRoute("HEAD", path, handler, middlewares);
	}

	/**
	 * Registers an OPTIONS route handler.
	 *
	 * @param path - URL path pattern (supports parameters like `:id`)
	 * @param handler - Function to handle OPTIONS requests
	 * @param middlewares - Optional middleware for this specific route
	 * @returns This router instance for method chaining
	 *
	 * @remarks
	 * OPTIONS requests are typically used for CORS preflight requests
	 * or to discover which HTTP methods are allowed for a resource.
	 *
	 * @example
	 * ```typescript
	 * // Custom OPTIONS handler
	 * router.options('/api/*', (ctx) => {
	 *   return ctx
	 *     .header('Allow', 'GET, POST, PUT, DELETE')
	 *     .status(200)
	 *     .text('');
	 * });
	 * ```
	 *
	 * @since 0.1.0
	 */
	options(
		path: string,
		handler: RouteHandler,
		...middlewares: Middleware[]
	): Router {
		return this.addRoute("OPTIONS", path, handler, middlewares);
	}

	/**
	 * Gets all routes registered with this router.
	 *
	 * @returns Array of route definitions
	 *
	 * @remarks
	 * This method is used internally by the application to access
	 * all routes when combining multiple routers or during route resolution.
	 *
	 * @example
	 * ```typescript
	 * const routes = router.getRoutes();
	 * console.log(`Router has ${routes.length} routes`);
	 * ```
	 *
	 * @since 0.1.0
	 */
	getRoutes(): Route[] {
		return this.routes;
	}

	/**
	 * Finds a matching route for the given HTTP method and path.
	 *
	 * @param method - HTTP method to match
	 * @param path - URL path to match against route patterns
	 * @returns Object containing the matched route and extracted parameters, or null if no match
	 *
	 * @remarks
	 * This method iterates through all registered routes and attempts to match
	 * the provided path against each route's pattern. It supports parameter
	 * extraction from URL paths (e.g., `/users/:id` matches `/users/123`).
	 *
	 * @example
	 * ```typescript
	 * const match = router.findRoute('GET', '/users/123');
	 * if (match) {
	 *   console.log(match.params.id); // '123'
	 *   // Execute the matched route handler
	 *   await match.route.handler(context);
	 * }
	 * ```
	 *
	 * @since 0.1.0
	 */
	findRoute(
		method: HttpMethod,
		path: string,
	): { route: Route; params: Record<string, string> } | null {
		for (const route of this.routes) {
			if (route.method !== method) continue;

			const match = this.matchPath(route.path, path);
			if (match) {
				return { route, params: match.params };
			}
		}
		return null;
	}

	/**
	 * Matches a route pattern against an actual URL path and extracts parameters.
	 *
	 * @private
	 * @param pattern - Route pattern (e.g., `/users/:id`)
	 * @param path - Actual URL path (e.g., `/users/123`)
	 * @returns Object with extracted parameters or null if no match
	 *
	 * @remarks
	 * This method converts the route pattern to a regular expression and
	 * attempts to match it against the provided path. If successful,
	 * it extracts parameter values and returns them as a key-value object.
	 *
	 * @since 0.1.0
	 */
	private matchPath(
		pattern: string,
		path: string,
	): { params: Record<string, string> } | null {
		const pathPattern = this.pathToRegex(pattern);
		const match = path.match(pathPattern.pattern);

		if (!match) return null;

		const params: Record<string, string> = {};
		pathPattern.keys.forEach((key, index) => {
			params[key] = match[index + 1] || "";
		});

		return { params };
	}

	/**
	 * Converts a route path pattern to a regular expression with parameter extraction.
	 *
	 * @private
	 * @param path - Route path pattern (e.g., `/users/:id`, `/files/*`)
	 * @returns Object containing the regex pattern and parameter key names
	 *
	 * @remarks
	 * This method transforms route patterns into regular expressions that can
	 * match actual URL paths. It supports:
	 * - Named parameters: `:id` becomes a capture group `([^/]+)`
	 * - Wildcard patterns: `*` becomes `.*` to match any sequence
	 *
	 * @example
	 * ```typescript
	 * // Pattern: '/users/:id/posts/:postId'
	 * // Result: { pattern: /^\/users\/([^/]+)\/posts\/([^/]+)$/, keys: ['id', 'postId'] }
	 *
	 * // Pattern: '/files/*'
	 * // Result: { pattern: /^\/files\/.*$/, keys: [] }
	 * ```
	 *
	 * @since 0.1.0
	 */
	private pathToRegex(path: string): PathPattern {
		const keys: string[] = [];

		// Replace :param with regex capture groups
		const pattern = path
			.replace(/:[^/]+/g, (match) => {
				const key = match.slice(1); // Remove the ':'
				keys.push(key);
				return "([^/]+)";
			})
			.replace(/\*/g, ".*"); // Replace * with catch-all

		return {
			pattern: new RegExp(`^${pattern}$`),
			keys,
		};
	}
}
