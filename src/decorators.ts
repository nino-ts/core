/**
 * @fileoverview Decorator-based routing system for NinoTS Framework
 * @module @ninots/core/decorators
 * @since 0.1.0
 */

import type { HttpMethod, Middleware } from "./types";

/**
 * Constructor type for classes that can be decorated.
 *
 * @internal
 * @since 0.1.0
 */
type Constructor = new (...args: unknown[]) => object;

/**
 * Metadata storage for route information collected from decorators.
 *
 * @internal
 * @since 0.1.0
 */
const routeMetadata = new Map<Constructor, RouteInfo[]>();

/**
 * Interface describing route information stored by decorators.
 *
 * @interface RouteInfo
 * @since 0.1.0
 */
interface RouteInfo {
	/** HTTP method for the route */
	method: HttpMethod;
	/** URL path pattern */
	path: string;
	/** Property name of the handler method */
	propertyKey: string;
	/** Array of middleware functions */
	middlewares: Middleware[];
}

/**
 * Shared type alias for HTTP method decorator signature.
 *
 * @since 0.1.0
 */
type RouteDecorator = (
	path: string,
	...middlewares: Middleware[]
) => (
	target: object,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) => PropertyDescriptor;

/**
 * Creates a route decorator factory for a specific HTTP method.
 *
 * @param method - HTTP method to create decorator for
 * @returns Decorator factory function
 *
 * @remarks
 * This is an internal utility function used to create all HTTP method decorators.
 * It standardizes the metadata collection process for all route decorators.
 *
 * @internal
 * @since 0.1.0
 */
function createRouteDecorator(method: HttpMethod): RouteDecorator {
	return (path: string, ...middlewares: Middleware[]) =>
		(target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
			const ctor = target.constructor as Constructor;
			if (!routeMetadata.has(ctor)) {
				routeMetadata.set(ctor, []);
			}

			const routes = routeMetadata.get(ctor);
			if (routes) {
				routes.push({
					method,
					path,
					propertyKey,
					middlewares,
				});
			}

			return descriptor;
		};
}

/**
 * HTTP Method Decorators
 */

/**
 * Decorator for handling GET requests.
 *
 * @param path - URL path pattern (supports parameters like '/users/:id')
 * @param middlewares - Optional route-specific middlewares
 * @returns Method decorator
 *
 * @remarks
 * Apply this decorator to controller methods that should handle GET requests.
 * The decorated method will be called when a matching GET request is received.
 *
 * @example
 * ```typescript
 * class UserController {
 *   @Get('/users/:id')
 *   async getUser(ctx: NinoContext) {
 *     const userId = ctx.params.id;
 *     return ctx.json({ id: userId });
 *   }
 *
 *   @Get('/users', cors(), rateLimit())
 *   async getUsers(ctx: NinoContext) {
 *     return ctx.json({ users: [] });
 *   }
 * }
export const Get: RouteDecorator = createRouteDecorator("GET");
```
 *
 * @public
 * @since 0.1.0
 */
export const Get: (
	path: string,
	...middlewares: Middleware[]
) => (
	target: object,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) => PropertyDescriptor = createRouteDecorator("GET");

/**
 * Decorator for handling POST requests.
 *
 * @param path - URL path pattern (supports parameters like '/users/:id')
 * @param middlewares - Optional route-specific middlewares
 * @returns Method decorator
 *
 * @remarks
 * Apply this decorator to controller methods that should handle POST requests.
 * Commonly used for creating new resources.
 *
 * @example
 * ```typescript
 * class UserController {
 *   @Post('/users', json())
 *   async createUser(ctx: NinoContext) {
 *     const userData = await ctx.body;
 *     return ctx.json({ created: userData });
 *   }
 * }
export const Post: RouteDecorator = createRouteDecorator("POST");
```
 *
 * @public
 * @since 0.1.0
 */
export const Post: (
	path: string,
	...middlewares: Middleware[]
) => (
	target: object,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) => PropertyDescriptor = createRouteDecorator("POST");

/**
 * Decorator for handling PUT requests.
 *
 * @param path - URL path pattern (supports parameters like '/users/:id')
 * @param middlewares - Optional route-specific middlewares
 * @returns Method decorator
 *
 * @remarks
 * Apply this decorator to controller methods that should handle PUT requests.
 * Commonly used for updating existing resources completely.
 *
 * @example
 * ```typescript
 * class UserController {
 *   @Put('/users/:id', json())
 *   async updateUser(ctx: NinoContext) {
 *     const userId = ctx.params.id;
 *     const userData = await ctx.body;
 *     return ctx.json({ id: userId, updated: userData });
 *   }
 * }
export const Put: RouteDecorator = createRouteDecorator("PUT");
```
 *
 * @public
 * @since 0.1.0
 */
export const Put: (
	path: string,
	...middlewares: Middleware[]
) => (
	target: object,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) => PropertyDescriptor = createRouteDecorator("PUT");

/**
 * Decorator for handling DELETE requests.
 *
 * @param path - URL path pattern (supports parameters like '/users/:id')
 * @param middlewares - Optional route-specific middlewares
 * @returns Method decorator
 *
 * @remarks
 * Apply this decorator to controller methods that should handle DELETE requests.
 * Commonly used for removing existing resources.
 *
 * @example
 * ```typescript
 * class UserController {
 *   @Delete('/users/:id')
 *   async deleteUser(ctx: NinoContext) {
 *     const userId = ctx.params.id;
 *     return ctx.json({ deleted: userId });
 *   }
 * }
export const Delete: RouteDecorator = createRouteDecorator("DELETE");
```
 *
 * @public
 * @since 0.1.0
 */
export const Delete: (
	path: string,
	...middlewares: Middleware[]
) => (
	target: object,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) => PropertyDescriptor = createRouteDecorator("DELETE");

/**
 * Decorator for handling PATCH requests.
 *
 * @param path - URL path pattern (supports parameters like '/users/:id')
 * @param middlewares - Optional route-specific middlewares
 * @returns Method decorator
 *
 * @remarks
 * Apply this decorator to controller methods that should handle PATCH requests.
 * Commonly used for partial updates to existing resources.
 *
 * @example
 * ```typescript
 * class UserController {
 *   @Patch('/users/:id', json())
 *   async patchUser(ctx: NinoContext) {
 *     const userId = ctx.params.id;
 *     const updates = await ctx.body;
 *     return ctx.json({ id: userId, patched: updates });
 *   }
 * }
export const Patch: RouteDecorator = createRouteDecorator("PATCH");
```
 *
 * @public
 * @since 0.1.0
 */
export const Patch: (
	path: string,
	...middlewares: Middleware[]
) => (
	target: object,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) => PropertyDescriptor = createRouteDecorator("PATCH");

/**
 * Decorator for handling HEAD requests.
 *
 * @param path - URL path pattern (supports parameters like '/users/:id')
 * @param middlewares - Optional route-specific middlewares
 * @returns Method decorator
 *
 * @remarks
 * Apply this decorator to controller methods that should handle HEAD requests.
 * HEAD requests are similar to GET but only return headers without the body.
 *
 * @example
 * ```typescript
 * class UserController {
 *   @Head('/users/:id')
 *   async checkUser(ctx: NinoContext) {
 *     const userId = ctx.params.id;
 *     return ctx.status(200).text('');
 *   }
 * }
export const Head: RouteDecorator = createRouteDecorator("HEAD");
```
 *
 * @public
 * @since 0.1.0
 */
export const Head: (
	path: string,
	...middlewares: Middleware[]
) => (
	target: object,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) => PropertyDescriptor = createRouteDecorator("HEAD");

/**
 * Decorator for handling OPTIONS requests.
 *
 * @param path - URL path pattern (supports parameters like '/users/:id')
 * @param middlewares - Optional route-specific middlewares
 * @returns Method decorator
 *
 * @remarks
 * Apply this decorator to controller methods that should handle OPTIONS requests.
 * Commonly used for CORS preflight requests and API capability discovery.
 *
 * @example
 * ```typescript
 * class UserController {
 *   @Options('/users/*')
/**
 * Type alias for the Controller decorator return type.
 *
 * @internal
 */
type ControllerDecorator = <T extends { new (...args: unknown[]): object }>(
	ctor: T,
) => T;

/**
 * Class decorator that marks a class as a route controller.
 *
 * @param basePath - Base path prefix for all routes in this controller
 * @returns Class decorator function
 *
 * @remarks
 * The Controller decorator automatically registers all decorated methods
 * in the class as routes when the controller is instantiated. It provides
 * a clean way to organize related routes into logical groups.
 *
 * All routes defined in the controller will be prefixed with the basePath.
 * The decorator collects metadata from HTTP method decorators (@Get, @Post, etc.)
 * and automatically registers them with the application.
 *
 * @example
 * ```typescript
 * @Controller('/api/users')
 * class UserController {
 *   @Get('/')
 *   async getAllUsers(ctx: NinoContext) {
 *     return ctx.json({ users: [] });
 *   }
 *
 *   @Get('/:id')
 *   async getUser(ctx: NinoContext) {
 *     return ctx.json({ id: ctx.params.id });
 *   }
 *
 *   @Post('/')
 *   async createUser(ctx: NinoContext) {
 *     return ctx.json({ created: true });
 *   }
 * }
 *
 * // Routes created:
 * // GET /api/users/
 * // GET /api/users/:id
 * // POST /api/users/
 * ```
 *
 * @public
 * @since 0.1.0
 */
export function Controller(basePath = ""): ControllerDecorator {
	return <T extends { new (...args: unknown[]): object }>(ctor: T) =>
		class extends ctor {
			constructor(...args: unknown[]) {
				super(...args);

				// Register routes from this controller
				const routes = routeMetadata.get(ctor) || [];
				routes.forEach((route) => {
					const fullPath = basePath + route.path;
					const handler = (this as Record<string, unknown>)[route.propertyKey];
					const handlerValue = (this as unknown)[route.propertyKey];

					if (
						typeof handlerValue === "function"
					) {
						// You would register these routes with your app instance
						console.log(`Registering ${route.method} ${fullPath}`);
					}
				});
			}
		};
}

/**
 * Method decorator for applying middleware to specific route handlers.
 *
 * @param middlewares - Middleware functions to apply to the decorated method
 * @returns Method decorator function
 *
 * @remarks
 * This decorator allows you to apply middleware to individual route methods
 * in addition to or instead of global middleware. Middleware applied with
 * this decorator will be executed before the route handler.
 *
 * Can be combined with HTTP method decorators for fine-grained middleware control.
 *
 * @example
 * ```typescript
 * @Controller('/api')
 * class ApiController {
 *   @Get('/public')
 *   async getPublicData(ctx: NinoContext) {
 *     return ctx.json({ public: true });
 *   }
 *
 *   @Get('/protected')
 *   @UseMiddleware(authMiddleware, rateLimit({ maxRequests: 10 }))
 *   async getProtectedData(ctx: NinoContext) {
 *     return ctx.json({ protected: true });
 *   }
 *
 *   @Post('/upload')
 *   @UseMiddleware(multerMiddleware, validateFileMiddleware)
 *   async uploadFile(ctx: NinoContext) {
 *     return ctx.json({ uploaded: true });
 *   }
 * }
 * ```
 *
 * @public
 * @since 0.1.0
 */
export function UseMiddleware(
	...middlewares: Middleware[]
): (
	target: object,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) => PropertyDescriptor {
	return (
		target: object,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) => {
		const existingRoutes = routeMetadata.get(target.constructor) || [];
		const routeIndex = existingRoutes.findIndex(
			(r) => r.propertyKey === propertyKey,
		);

		if (routeIndex >= 0 && existingRoutes[routeIndex]) {
			existingRoutes[routeIndex].middlewares.push(...middlewares);
		} else {
			// Store middleware for later use when route decorator is applied
			if (!target._pendingMiddlewares) {
				target._pendingMiddlewares = new Map();
			}
			target._pendingMiddlewares.set(propertyKey, middlewares);
		}

		return descriptor;
	};
}

/**
 * Parameter decorators for automatic dependency injection
 */

/**
 * Parameter decorator that injects the request body into the method parameter.
 *
 * @returns Parameter decorator function
 *
 * @remarks
 * This decorator automatically injects the parsed request body into the
 * decorated parameter. The body is parsed based on the Content-Type header.
 *
 * For JSON requests, the body will be parsed as JSON. For form data,
 * it will be parsed as form data. The parsing happens automatically
 * before the method is called.
 *
 * @example
 * ```typescript
 * @Controller('/api/users')
 * class UserController {
 *   @Post('/')
 *   async createUser(@Body() userData: CreateUserDto) {
 *     // userData contains the parsed request body
 *     return { id: 1, ...userData };
 *   }
 *
 *   @Put('/:id')
 *   async updateUser(@Param('id') id: string, @Body() updates: UpdateUserDto) {
 *     return { id, ...updates };
 *   }
 * }
 * ```
 *
 * @public
 * @since 0.1.0
 */
export function Body(): (
	target: object,
	propertyKey: string | symbol | undefined,
	parameterIndex: number,
) => void {
	return (
		target: object,
		propertyKey: string | symbol | undefined,
		parameterIndex: number,
	) => {
		// Store parameter metadata for injection
		if (!target._paramMetadata) {
			target._paramMetadata = new Map();
		}

		const existingParams = target._paramMetadata.get(propertyKey) || [];
		existingParams[parameterIndex] = { type: "body" };
		target._paramMetadata.set(propertyKey, existingParams);
	};
}

/**
 * Parameter decorator that injects query parameters into the method parameter.
 *
 * @param key - Optional specific query parameter key to extract
 * @returns Parameter decorator function
 *
 * @remarks
 * This decorator injects query parameters from the URL into the decorated
 * parameter. If a key is provided, only that specific query parameter is
 * injected. If no key is provided, all query parameters are injected as an object.
 *
 * @example
 * ```typescript
 * @Controller('/api/users')
 * class UserController {
 *   @Get('/')
 *   async getUsers(@Query() query: any) {
 *     // query contains all query parameters: { page: '1', limit: '10' }
 *     return { users: [], page: query.page };
 *   }
 *
 *   @Get('/search')
 *   async searchUsers(@Query('q') searchQuery: string, @Query('limit') limit: string) {
 *     // searchQuery contains the 'q' parameter value
 *     // limit contains the 'limit' parameter value
 *     return { results: [], query: searchQuery };
 *   }
 * }
 * ```
 *
 * @public
 * @since 0.1.0
 */
export function Query(
	key?: string,
): (
	target: object,
	propertyKey: string | symbol | undefined,
	parameterIndex: number,
) => void {
	return (
		target: object,
		propertyKey: string | symbol | undefined,
		parameterIndex: number,
	) => {
		if (!target._paramMetadata) {
			target._paramMetadata = new Map();
		}

		const existingParams = target._paramMetadata.get(propertyKey) || [];
		existingParams[parameterIndex] = { type: "query", key };
		target._paramMetadata.set(propertyKey, existingParams);
	};
}

/**
 * Parameter decorator that injects path parameters into the method parameter.
 *
 * @param key - Path parameter name to extract (must match route pattern)
 * @returns Parameter decorator function
 *
 * @remarks
 * This decorator injects path parameters from the URL route into the decorated
 * parameter. The key must match a parameter defined in the route pattern.
 *
 * Path parameters are automatically parsed from routes like '/users/:id/posts/:postId'.
 *
 * @example
 * ```typescript
 * @Controller('/api/users')
 * class UserController {
 *   @Get('/:id')
 *   async getUser(@Param('id') userId: string) {
 *     // userId contains the value from the :id parameter
 *     return { id: userId };
 *   }
 *
 *   @Get('/:id/posts/:postId')
 *   async getUserPost(@Param('id') userId: string, @Param('postId') postId: string) {
 *     return { userId, postId };
 *   }
 * }
 * ```
 *
 * @public
 * @since 0.1.0
 */
export function Param(
	key: string,
): (
	target: object,
	propertyKey: string | symbol | undefined,
	parameterIndex: number,
) => void {
	return (
		target: object,
		propertyKey: string | symbol | undefined,
		parameterIndex: number,
	) => {
		if (!target._paramMetadata) {
			target._paramMetadata = new Map();
		}

		const existingParams = target._paramMetadata.get(propertyKey) || [];
		existingParams[parameterIndex] = { type: "param", key };
		target._paramMetadata.set(propertyKey, existingParams);
	};
}

/**
 * Parameter decorator that injects the full request context into the method parameter.
 *
 * @returns Parameter decorator function
 *
 * @remarks
 * This decorator injects the complete NinoContext object into the decorated
 * parameter, giving full access to the request, response helpers, and all
 * context methods.
 *
 * Use this when you need access to headers, cookies, or other request
 * properties not covered by other parameter decorators.
 *
 * @example
 * ```typescript
 * @Controller('/api')
 * class ApiController {
 *   @Get('/info')
 *   async getRequestInfo(@Ctx() ctx: NinoContext) {
 *     return {
 *       method: ctx.method,
 *       url: ctx.url.pathname,
 *       headers: Object.fromEntries(ctx.headers.entries()),
 *       userAgent: ctx.headers.get('user-agent')
 *     };
 *   }
 *
 *   @Post('/upload')
 *   async upload(@Body() data: any, @Ctx() ctx: NinoContext) {
 *     const contentType = ctx.headers.get('content-type');
 *     return ctx.json({ uploaded: true, contentType });
 *   }
 * }
 * ```
 *
 * @public
 * @since 0.1.0
 */
export function Ctx(): (
	target: object,
	propertyKey: string | symbol | undefined,
	parameterIndex: number,
) => void {
	return (
		target: object,
		propertyKey: string | symbol | undefined,
		parameterIndex: number,
	) => {
		if (!target._paramMetadata) {
			target._paramMetadata = new Map();
		}

		const existingParams = target._paramMetadata.get(propertyKey) || [];
		existingParams[parameterIndex] = { type: "context" };
		target._paramMetadata.set(propertyKey, existingParams);
	};
}

/**
 * Retrieves route metadata for a controller class.
 *
 * @param constructor - Controller class constructor
 * @returns Array of route information collected from decorators
 *
 * @remarks
 * This utility function extracts all route metadata that was collected
 * by HTTP method decorators (@Get, @Post, etc.) from a controller class.
 *
 * Useful for framework integration and testing purposes where you need
 * to programmatically access the routes defined in a controller.
 *
 * @example
 * ```typescript
 * @Controller('/api/users')
 * class UserController {
 *   @Get('/')
 *   async getUsers() { }
 *
 *   @Post('/')
 *   async createUser() { }
 * }
 *
 * const routes = getRouteMetadata(UserController);
 * console.log(routes);
 * // [
 * //   { method: 'GET', path: '/', propertyKey: 'getUsers', middlewares: [] },
 * //   { method: 'POST', path: '/', propertyKey: 'createUser', middlewares: [] }
 * // ]
 * ```
 *
 * @public
 * @since 0.1.0
 */
export function getRouteMetadata(ctor: Constructor): RouteInfo[] {
	return routeMetadata.get(ctor) || [];
}

/**
 * Clears all stored route metadata.
 *
 * @remarks
 * This utility function clears the internal metadata storage used by
 * the decorator system. Primarily useful for testing scenarios where
 * you need to reset the decorator state between tests.
 *
 * ⚠️ **Warning**: This will clear ALL route metadata for ALL controllers.
 * Use with caution in production environments.
 *
 * @example
 * ```typescript
 * // In test setup
 * beforeEach(() => {
 *   clearRouteMetadata();
 * });
 *
 * // Or manually when needed
 * clearRouteMetadata();
 * ```
 *
 * @public
 * @since 0.1.0
 */
export function clearRouteMetadata(): void {
	routeMetadata.clear();
}
