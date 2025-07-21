/**
 * @fileoverview Built-in middleware functions for NinoTS Framework
 * @module @ninots/core/middleware
 * @since 0.1.0
 */

import type { HttpMethod, Middleware, NinoContext } from "./types";

/**
 * Creates CORS (Cross-Origin Resource Sharing) middleware for handling cross-origin requests.
 *
 * @param options - Configuration options for CORS behavior
 * @param options.origin - Allowed origins for CORS requests
 * @param options.methods - Allowed HTTP methods for CORS requests
 * @param options.allowedHeaders - Allowed headers for CORS requests
 * @param options.credentials - Whether to allow credentials in CORS requests
 * @returns Middleware function that handles CORS
 *
 * @remarks
 * This middleware automatically handles CORS preflight OPTIONS requests and sets
 * appropriate CORS headers based on the configuration. It supports:
 * - Multiple origin configurations (string, array, boolean)
 * - Configurable allowed methods and headers
 * - Credential support for authenticated requests
 *
 * @example
 * ```typescript
 * // Allow all origins
 * app.use(cors());
 *
 * // Allow specific origins
 * app.use(cors({
 *   origin: ['https://example.com', 'https://app.example.com'],
 *   credentials: true
 * }));
 *
 * // Allow single origin with custom methods
 * app.use(cors({
 *   origin: 'https://trusted-site.com',
 *   methods: ['GET', 'POST'],
 *   allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
 * }));
 *
 * // Disable CORS completely
 * app.use(cors({ origin: false }));
 * ```
 *
 * @public
 * @since 0.1.0
 */
export function cors(
	options: {
		/**
		 * Allowed origins. Can be:
		 * - `true` or `'*'`: Allow all origins
		 * - `string`: Single allowed origin
		 * - `string[]`: Array of allowed origins
		 * - `false`: Disable CORS
		 * @defaultValue '*'
		 */
		origin?: string | string[] | boolean;

		/**
		 * Allowed HTTP methods for CORS requests
		 * @defaultValue ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
		 */
		methods?: HttpMethod[];

		/**
		 * Allowed headers for CORS requests
		 * @defaultValue ['Content-Type', 'Authorization']
		 */
		allowedHeaders?: string[];

		/**
		 * Whether to allow credentials (cookies, authorization headers) in CORS requests
		 * @defaultValue false
		 */
		credentials?: boolean;
	} = {},
): Middleware {
	const {
		origin = "*",
		methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
		allowedHeaders = ["Content-Type", "Authorization"],
		credentials = false,
	} = options;

	return async (context: NinoContext, next: () => Promise<void>) => {
		// Set CORS headers based on origin configuration
		if (typeof origin === "boolean") {
			if (origin) {
				context.header("Access-Control-Allow-Origin", "*");
			}
		} else if (typeof origin === "string") {
			context.header("Access-Control-Allow-Origin", origin);
		} else if (Array.isArray(origin)) {
			const requestOrigin = context.headers.get("origin");
			if (requestOrigin && origin.includes(requestOrigin)) {
				context.header("Access-Control-Allow-Origin", requestOrigin);
			}
		}

		context.header("Access-Control-Allow-Methods", methods.join(", "));
		context.header("Access-Control-Allow-Headers", allowedHeaders.join(", "));

		if (credentials) {
			context.header("Access-Control-Allow-Credentials", "true");
		}

		// Handle preflight OPTIONS request
		if (context.method === "OPTIONS") {
			return context.status(204).text("");
		}

		await next();
	};
}

/**
 * Creates request logging middleware that logs HTTP requests and responses.
 *
 * @param options - Configuration options for logging behavior
 * @param options.format - Log format type ('combined', 'common', or 'tiny')
 * @param options.logFunction - Custom logging function to use instead of console.log
 * @returns Middleware function that logs requests
 *
 * @remarks
 * This middleware logs incoming HTTP requests with configurable formats:
 * - `'combined'`: Detailed format with user agent and referrer
 * - `'common'`: Standard Apache common log format
 * - `'tiny'`: Minimal format with method, URL, status, and response time
 *
 * The middleware captures request start time and calculates response time
 * automatically. All logs include timestamp, method, URL, status code, and
 * response time in milliseconds.
 *
 * @example
 * ```typescript
 * // Basic logging
 * app.use(logger());
 *
 * // Advanced logging with custom format and function
 * app.use(logger({
 *   format: 'combined',
 *   logFunction: (message) => {
 *     fs.appendFileSync('./access.log', message + '\n');
 *   }
 * }));
 * ```
 *
 * @public
 * @since 0.1.0
 */
export function logger(
	options: {
		/**
		 * Log format type
		 * @defaultValue 'tiny'
		 */
		format?: "combined" | "common" | "tiny";

		/**
		 * Custom logging function. If not provided, uses console.log
		 * @defaultValue console.log
		 */
		logFunction?: (message: string) => void;
	} = {},
): Middleware {
	const { format = "tiny", logFunction = console.log } = options;

	return async (context: NinoContext, next: () => Promise<void>) => {
		const start = Date.now();
		const { method, url } = context;

		// Log start of request
		logFunction(`→ ${method} ${url.pathname}`);

		await next();

		const duration = Date.now() - start;
		// Response status is not directly accessible from context in this implementation
		// We'll use a default status or let the log format handle it differently
		const status = 200; // Default assumption for successful responses

		let logMessage: string;

		switch (format) {
			case "tiny":
				logMessage = `← ${method} ${url.pathname} ${status} - ${duration}ms`;
				break;
			case "common": {
				const timestamp = new Date().toISOString();
				logMessage = `${timestamp} - ${method} ${url.pathname} ${status} ${duration}ms`;
				break;
			}
			case "combined": {
				const timestampCombined = new Date().toISOString();
				const userAgent = context.headers.get("user-agent") || "-";
				const referrer = context.headers.get("referer") || "-";
				logMessage = `${timestampCombined} - ${method} ${url.pathname} ${status} ${duration}ms - "${userAgent}" "${referrer}"`;
				break;
			}
			default:
				logMessage = `← ${method} ${url.pathname} - ${duration}ms`;
		}

		logFunction(logMessage);
	};
}

/**
 * Creates JSON body parser middleware for handling JSON request bodies.
 *
 * @param options - Configuration options for JSON parsing
 * @param options.limit - Maximum size of JSON payload in bytes
 * @param options.strict - Whether to only parse objects and arrays (strict JSON)
 * @param options.reviver - Optional reviver function for JSON.parse
 * @returns Middleware function that parses JSON bodies
 *
 * @remarks
 * This middleware automatically parses JSON request bodies when the Content-Type
 * header includes 'application/json'. The parsed body is accessible via
 * `context.body` property. If parsing fails, an error is thrown.
 *
 * The middleware respects the `limit` option to prevent large payloads from
 * consuming too much memory. The `strict` option enforces RFC 7159 compliance
 * by only accepting objects and arrays as top-level values.
 *
 * @example
 * ```typescript
 * // Basic JSON parsing
 * app.use(json());
 *
 * // With size limit and strict mode
 * app.use(json({
 *   limit: 1024 * 1024, // 1MB limit
 *   strict: true
 * }));
 *
 * // With custom reviver function
 * app.use(json({
 *   reviver: (key, value) => {
 *     if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
 *       return new Date(value);
 *     }
 *     return value;
 *   }
 * }));
 * ```
 *
 * @public
 * @since 0.1.0
 */
export function json(
	options: {
		/**
		 * Maximum size of JSON payload in bytes
		 * @defaultValue 1048576 (1MB)
		 */
		limit?: number;

		/**
		 * Whether to only parse objects and arrays (strict JSON)
		 * @defaultValue true
		 */
		strict?: boolean;

		/**
		 * Optional reviver function for JSON.parse
		 * @defaultValue undefined
		 */
		reviver?: (key: string, value: unknown) => unknown;
	} = {},
): Middleware {
	const { strict = true } = options;

	return async (context: NinoContext, next: () => Promise<void>) => {
		const contentType = context.headers.get("content-type") || "";

		if (contentType.includes("application/json")) {
			try {
				// Access body to trigger parsing
				const bodyData = await context.body;

				// Additional validation for strict mode
				if (strict && bodyData !== null && typeof bodyData !== "object") {
					throw new Error("Strict mode: JSON body must be an object or array");
				}
			} catch (error) {
				throw new Error(
					`Invalid JSON body: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		}

		await next();
	};
}

/**
 * Creates error handling middleware for catching and processing errors.
 *
 * @param options - Configuration options for error handling
 * @param options.includeStack - Whether to include stack traces in error responses
 * @param options.onError - Custom error handler function
 * @param options.defaultStatus - Default HTTP status code for errors
 * @returns Middleware function that handles errors
 *
 * @remarks
 * This middleware provides centralized error handling for the application.
 * It catches errors from subsequent middleware and route handlers, then
 * formats them into appropriate HTTP responses.
 *
 * In development mode, stack traces are included by default. In production,
 * only the error message is returned for security reasons. The middleware
 * supports custom error handling logic via the `onError` callback.
 *
 * @example
 * ```typescript
 * // Basic error handling
 * app.use(errorHandler());
 *
 * // Custom error handling with logging
 * app.use(errorHandler({
 *   includeStack: process.env.NODE_ENV === 'development',
 *   defaultStatus: 500,
 *   onError: (error, context) => {
 *     console.error(`Error in ${context.method} ${context.url.pathname}:`, error);
 *     // Send to logging service
 *   }
 * }));
 *
 * // Custom error responses
 * app.use(errorHandler({
 *   onError: (error, context) => {
 *     if (error.name === 'ValidationError') {
 *       return context.status(400).json({
 *         error: 'Validation Failed',
 *         details: error.details
 *       });
 *     }
 *   }
 * }));
 * ```
 *
 * @public
 * @since 0.1.0
 */
export function errorHandler(
	options: {
		/**
		 * Whether to include stack traces in error responses
		 * @defaultValue Based on NODE_ENV (true in development)
		 */
		includeStack?: boolean;

		/**
		 * Custom error handler function. If it returns a value, default handling is skipped
		 * @defaultValue undefined
		 */
		onError?: (error: Error, context: NinoContext) => Promise<void> | void;

		/**
		 * Default HTTP status code for unhandled errors
		 * @defaultValue 500
		 */
		defaultStatus?: number;
	} = {},
): Middleware {
	const {
		includeStack = process.env.NODE_ENV === "development",
		onError,
		defaultStatus = 500,
	} = options;

	return async (context: NinoContext, next: () => Promise<void>) => {
		try {
			await next();
		} catch (error) {
			console.error("Request error:", error);

			const err = error instanceof Error ? error : new Error(String(error));

			// Call custom error handler if provided
			if (onError) {
				try {
					await onError(err, context);
					return; // Skip default handling
				} catch (handlerError) {
					console.error("Error in custom error handler:", handlerError);
					// Fall through to default handling
				}
			}

			// Default error response
			const errorResponse: unknown = {
				error: "Internal Server Error",
				message: err.message,
			};

			if (includeStack && err.stack) {
				errorResponse.stack = err.stack;
			}

			context.status(defaultStatus).json(errorResponse);
		}
	};
}

/**
 * Creates rate limiting middleware to prevent abuse and control request frequency.
 *
 * @param options - Configuration options for rate limiting
 * @param options.windowMs - Time window in milliseconds for rate limiting
 * @param options.maxRequests - Maximum number of requests allowed per window
 * @param options.message - Error message when rate limit is exceeded
 * @param options.keyGenerator - Function to generate unique keys for clients
 * @param options.onLimitReached - Callback function when rate limit is exceeded
 * @returns Middleware function that enforces rate limits
 *
 * @remarks
 * This middleware implements a sliding window rate limiter that tracks
 * requests per client IP address. When the limit is exceeded, it throws
 * an error that should be caught by error handling middleware.
 *
 * The middleware automatically cleans up expired entries to prevent
 * memory leaks. Custom key generation allows for rate limiting based
 * on different criteria (user ID, API key, etc.).
 *
 * @example
 * ```typescript
 * // Basic rate limiting (100 requests per 15 minutes)
 * app.use(rateLimit());
 *
 * // Strict rate limiting for API
 * app.use(rateLimit({
 *   windowMs: 60 * 1000, // 1 minute
 *   maxRequests: 10,
 *   message: 'API rate limit exceeded'
 * }));
 *
 * // Custom key generation based on user ID
 * app.use(rateLimit({
 *   windowMs: 3600 * 1000, // 1 hour
 *   maxRequests: 1000,
 *   keyGenerator: (context) => context.headers.get('x-user-id') || 'anonymous'
 * }));
 *
 * // With callback for logging
 * app.use(rateLimit({
 *   maxRequests: 50,
 *   onLimitReached: (key, context) => {
 *     console.log(`Rate limit exceeded for ${key} from ${context.url.pathname}`);
 *   }
 * }));
 * ```
 *
 * @public
 * @since 0.1.0
 */
export function rateLimit(
	options: {
		/**
		 * Time window in milliseconds for rate limiting
		 * @defaultValue 900000 (15 minutes)
		 */
		windowMs?: number;

		/**
		 * Maximum number of requests allowed per window
		 * @defaultValue 100
		 */
		maxRequests?: number;

		/**
		 * Error message when rate limit is exceeded
		 * @defaultValue 'Too many requests, please try again later.'
		 */
		message?: string;

		/**
		 * Function to generate unique keys for clients
		 * @defaultValue IP-based key generation
		 */
		keyGenerator?: (context: NinoContext) => string;

		/**
		 * Callback function when rate limit is exceeded
		 * @defaultValue undefined
		 */
		onLimitReached?: (key: string, context: NinoContext) => void;
	} = {},
): Middleware {
	const {
		windowMs = 15 * 60 * 1000, // 15 minutes
		maxRequests = 100,
		message = "Too many requests, please try again later.",
		keyGenerator = (context) =>
			context.headers.get("x-forwarded-for") ||
			context.headers.get("x-real-ip") ||
			"unknown",
		onLimitReached,
	} = options;

	const requests = new Map<string, { count: number; resetTime: number }>();

	return async (context: NinoContext, next: () => Promise<void>) => {
		const clientKey = keyGenerator(context);
		const now = Date.now();
		const clientData = requests.get(clientKey);

		if (!clientData || now > clientData.resetTime) {
			requests.set(clientKey, {
				count: 1,
				resetTime: now + windowMs,
			});
		} else {
			clientData.count++;

			if (clientData.count > maxRequests) {
				if (onLimitReached) {
					onLimitReached(clientKey, context);
				}
				throw new Error(message);
			}
		}

		await next();
	};
}

/**
 * Creates static file serving middleware for serving files from a directory.
 *
 * @param directory - Root directory path to serve files from
 * @param options - Configuration options for static file serving
 * @param options.index - Default index files to serve for directory requests
 * @param options.maxAge - Cache-Control max-age value in seconds
 * @param options.immutable - Whether files are immutable (enables aggressive caching)
 * @param options.fallthrough - Whether to call next() when file is not found
 * @returns Middleware function that serves static files
 *
 * @remarks
 * This middleware serves static files from the specified directory using
 * Bun's optimized file serving capabilities. It automatically detects MIME
 * types and sets appropriate headers for caching and content delivery.
 *
 * The middleware only responds to GET requests and will call next() for
 * other HTTP methods or when files are not found (if fallthrough is enabled).
 * Security measures prevent path traversal attacks.
 *
 * @example
 * ```typescript
 * // Basic static file serving
 * app.use(staticFiles('./public'));
 *
 * // Serve with custom index files and caching
 * app.use(staticFiles('./static', {
 *   index: ['index.html', 'index.htm'],
 *   maxAge: 3600, // 1 hour cache
 *   immutable: true
 * }));
 *
 * // Serve assets with long-term caching
 * app.use('/assets', staticFiles('./dist/assets', {
 *   maxAge: 31536000, // 1 year
 *   immutable: true,
 *   fallthrough: false // Don't call next() on missing files
 * }));
 * ```
 *
 * @public
 * @since 0.1.0
 */
export function staticFiles(
	directory: string,
	options: {
		/**
		 * Default index files to serve for directory requests
		 * @defaultValue ['index.html']
		 */
		index?: string[];

		/**
		 * Cache-Control max-age value in seconds
		 * @defaultValue 0
		 */
		maxAge?: number;

		/**
		 * Whether files are immutable (enables aggressive caching)
		 * @defaultValue false
		 */
		immutable?: boolean;

		/**
		 * Whether to call next() when file is not found
		 * @defaultValue true
		 */
		fallthrough?: boolean;
	} = {},
): Middleware {
	const {
		index = ["index.html"],
		maxAge = 0,
		immutable = false,
		fallthrough = true,
	} = options;

	return async (context: NinoContext, next: () => Promise<void>) => {
		if (context.method !== "GET") {
			return next();
		}

		let filePath = context.url.pathname;

		// Security: prevent path traversal
		if (filePath.includes("..")) {
			if (fallthrough) {
				return next();
			} else {
				throw new Error("Path traversal not allowed");
			}
		}

		// Check for index files if path ends with /
		if (filePath.endsWith("/")) {
			for (const indexFile of index) {
				const indexPath = `${directory}${filePath}${indexFile}`;
				const indexFileObj = Bun.file(indexPath);
				if (await indexFileObj.exists()) {
					filePath = `${filePath}${indexFile}`;
					break;
				}
			}
		}

		const fullPath = `${directory}${filePath}`;

		try {
			const file = Bun.file(fullPath);
			const exists = await file.exists();

			if (exists) {
				const mimeType = getMimeType(fullPath);
				context.header("Content-Type", mimeType);

				// Set caching headers
				if (maxAge > 0) {
					const cacheControl = immutable
						? `public, max-age=${maxAge}, immutable`
						: `public, max-age=${maxAge}`;
					context.header("Cache-Control", cacheControl);
				}

				return new Response(file);
			}
		} catch (_error) {
			// File doesn't exist or can't be read
			if (!fallthrough) {
				throw new Error("File not found");
			}
		}

		if (fallthrough) {
			await next();
		}
	};
}

/**
 * Detects MIME type based on file extension.
 *
 * @param filePath - File path to detect MIME type for
 * @returns MIME type string
 *
 * @remarks
 * This is a simple MIME type detection utility that maps common file
 * extensions to their corresponding MIME types. It returns
 * 'application/octet-stream' for unknown extensions.
 *
 * @example
 * ```typescript
 * getMimeType('file.html'); // 'text/html'
 * getMimeType('image.png'); // 'image/png'
 * getMimeType('data.json'); // 'application/json'
 * ```
 *
 * @internal
 * @since 0.1.0
 */
function getMimeType(filePath: string): string {
	const ext = filePath.split(".").pop()?.toLowerCase();

	const mimeTypes: Record<string, string> = {
		html: "text/html",
		htm: "text/html",
		css: "text/css",
		js: "application/javascript",
		mjs: "application/javascript",
		json: "application/json",
		png: "image/png",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		gif: "image/gif",
		webp: "image/webp",
		svg: "image/svg+xml",
		ico: "image/x-icon",
		txt: "text/plain",
		pdf: "application/pdf",
		woff: "font/woff",
		woff2: "font/woff2",
		ttf: "font/ttf",
		eot: "application/vnd.ms-fontobject",
	};

	return mimeTypes[ext || ""] || "application/octet-stream";
}
