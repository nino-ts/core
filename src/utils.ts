/**
 * @fileoverview Utility functions and constants for NinoTS Framework
 * @module @ninots/core/utils
 * @since 0.1.0
 */

/**
 * HTTP status code constants for consistent response handling.
 * 
 * @remarks
 * Provides a comprehensive set of HTTP status codes organized by category.
 * Use these constants instead of magic numbers to improve code readability
 * and maintainability.
 * 
 * @example
 * ```typescript
 * // Instead of:
 * return ctx.status(201).json(data);
 * 
 * // Use:
 * return ctx.status(HttpStatus.CREATED).json(data);
 * 
 * // Error handling
 * if (user.role !== 'admin') {
 *   return ctx.status(HttpStatus.FORBIDDEN).json({ error: 'Access denied' });
 * }
 * ```
 * 
 * @public
 * @since 0.1.0
 */
export const HttpStatus = {
  // 1xx Informational responses
  
  /** The server has received the request headers and client should proceed to send the request body */
  CONTINUE: 100,
  
  /** The requester has asked the server to switch protocols */
  SWITCHING_PROTOCOLS: 101,
  
  // 2xx Success responses
  
  /** Standard response for successful HTTP requests */
  OK: 200,
  
  /** The request has been fulfilled, resulting in the creation of a new resource */
  CREATED: 201,
  
  /** The request has been accepted for processing, but processing has not been completed */
  ACCEPTED: 202,
  
  /** The server successfully processed the request, but is returning no content */
  NO_CONTENT: 204,
  
  // 3xx Redirection responses
  
  /** This and all future requests should be directed to the given URI */
  MOVED_PERMANENTLY: 301,
  
  /** The resource was found but at a different URI */
  FOUND: 302,
  
  /** Indicates that the resource has not been modified since last requested */
  NOT_MODIFIED: 304,
  
  // 4xx Client error responses
  
  /** The server cannot or will not process the request due to an apparent client error */
  BAD_REQUEST: 400,
  
  /** Similar to 403 Forbidden, but specifically for authentication is required */
  UNAUTHORIZED: 401,
  
  /** The request was valid, but the server is refusing action */
  FORBIDDEN: 403,
  
  /** The requested resource could not be found */
  NOT_FOUND: 404,
  
  /** A request method is not supported for the requested resource */
  METHOD_NOT_ALLOWED: 405,
  
  /** Indicates that the request could not be processed because of conflict in the current state */
  CONFLICT: 409,
  
  /** The request was well-formed but was unable to be followed due to semantic errors */
  UNPROCESSABLE_ENTITY: 422,
  
  /** The user has sent too many requests in a given amount of time */
  TOO_MANY_REQUESTS: 429,
  
  // 5xx Server error responses
  
  /** A generic error message when an unexpected condition was encountered */
  INTERNAL_SERVER_ERROR: 500,
  
  /** The server either does not recognize the request method or lacks the ability to fulfill it */
  NOT_IMPLEMENTED: 501,
  
  /** The server was acting as a gateway or proxy and received an invalid response */
  BAD_GATEWAY: 502,
  
  /** The server cannot handle the request due to temporary overloading or maintenance */
  SERVICE_UNAVAILABLE: 503,
  
  /** The server was acting as a gateway or proxy and did not receive a timely response */
  GATEWAY_TIMEOUT: 504
} as const;

/**
 * MIME type constants for Content-Type headers and file handling.
 * 
 * @remarks
 * Common MIME types used in web applications. These constants help
 * ensure correct Content-Type headers and file type detection.
 * 
 * @example
 * ```typescript
 * // Setting response content type
 * ctx.header('Content-Type', MimeType.JSON);
 * 
 * // File upload validation
 * if (file.type === MimeType.PNG || file.type === MimeType.JPEG) {
 *   // Process image
 * }
 * 
 * // API responses
 * return new Response(data, {
 *   headers: { 'Content-Type': MimeType.JSON }
 * });
 * ```
 * 
 * @public
 * @since 0.1.0
 */
export const MimeType = {
  /** JSON data format */
  JSON: 'application/json',
  
  /** HTML documents */
  HTML: 'text/html',
  
  /** Plain text */
  TEXT: 'text/plain',
  
  /** XML documents */
  XML: 'application/xml',
  
  /** URL-encoded form data */
  FORM: 'application/x-www-form-urlencoded',
  
  /** Multipart form data (file uploads) */
  MULTIPART: 'multipart/form-data',
  
  /** Binary data */
  BINARY: 'application/octet-stream',
  
  /** PDF documents */
  PDF: 'application/pdf',
  
  /** PNG images */
  PNG: 'image/png',
  
  /** JPEG images */
  JPEG: 'image/jpeg',
  
  /** GIF images */
  GIF: 'image/gif',
  
  /** SVG vector graphics */
  SVG: 'image/svg+xml'
} as const;

/**
 * Environment variable utilities for configuration management.
 * 
 * @remarks
 * Provides type-safe environment variable access with defaults and validation.
 * Supports different data types and common environment patterns.
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const port = env.getNumber('PORT', 3000);
 * const dbUrl = env.getRequired('DATABASE_URL');
 * 
 * // Environment checks
 * if (env.isDevelopment()) {
 *   console.log('Debug info:', env.get('DEBUG_LEVEL', 'info'));
 * }
 * 
 * // Configuration object
 * const config = {
 *   port: env.getNumber('PORT', 3000),
 *   host: env.get('HOST', 'localhost'),
 *   secure: env.getBoolean('HTTPS_ENABLED', false),
 *   apiKey: env.getRequired('API_KEY')
 * };
 * ```
 * 
 * @namespace env
 * @public
 * @since 0.1.0
 */
export const env = {
  /**
   * Gets an environment variable with optional default value.
   * 
   * @param key - Environment variable name
   * @param defaultValue - Default value if variable is not set
   * @returns Environment variable value or default
   */
  get(key: string, defaultValue?: string): string | undefined {
    return process.env[key] || defaultValue;
  },

  /**
   * Gets a required environment variable, throws if not found.
   * 
   * @param key - Environment variable name
   * @returns Environment variable value
   * @throws Error if environment variable is not set
   */
  getRequired(key: string): string {
    const value = process.env[key];
    if (value === undefined) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  },

  /**
   * Gets an environment variable as a number.
   * 
   * @param key - Environment variable name
   * @param defaultValue - Default value if variable is not set or invalid
   * @returns Parsed number or default value
   */
  getNumber(key: string, defaultValue?: number): number | undefined {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  },

  /**
   * Gets an environment variable as a boolean.
   * 
   * @param key - Environment variable name
   * @param defaultValue - Default value if variable is not set
   * @returns Boolean value (true for 'true' or '1', false otherwise)
   */
  getBoolean(key: string, defaultValue = false): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  },

  /**
   * Checks if running in development mode.
   * 
   * @returns True if NODE_ENV is 'development'
   */
  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  },

  /**
   * Checks if running in production mode.
   * 
   * @returns True if NODE_ENV is 'production'
   */
  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  },

  /**
   * Checks if running in test mode.
   * 
   * @returns True if NODE_ENV is 'test'
   */
  isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }
};

/**
 * Validation utilities for common data validation tasks.
 * 
 * @remarks
 * Provides a set of common validation functions for web applications.
 * These utilities help ensure data integrity and user input validation.
 * 
 * @example
 * ```typescript
 * // Email validation
 * if (!validate.email(userEmail)) {
 *   return ctx.status(400).json({ error: 'Invalid email format' });
 * }
 * 
 * // URL validation
 * if (validate.url(websiteUrl)) {
 *   // Process valid URL
 * }
 * 
 * // Input validation
 * const errors = [];
 * if (!validate.required(username)) errors.push('Username is required');
 * if (!validate.minLength(password, 8)) errors.push('Password too short');
 * if (!validate.range(age, 13, 120)) errors.push('Invalid age');
 * ```
 * 
 * @namespace validate
 * @public
 * @since 0.1.0
 */
export const validate = {
  /**
   * Validates email address format.
   * 
   * @param email - Email string to validate
   * @returns True if email format is valid
   */
  email(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validates URL format.
   * 
   * @param url - URL string to validate
   * @returns True if URL format is valid
   */
  url(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validates UUID format (v4).
   * 
   * @param uuid - UUID string to validate
   * @returns True if UUID format is valid
   */
  uuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  /**
   * Checks if value is not null or undefined.
   * 
   * @param value - Value to check
   * @returns True if value is present
   */
  required(value: any): boolean {
    return value !== null && value !== undefined;
  },

  /**
   * Validates minimum string length.
   * 
   * @param str - String to validate
   * @param min - Minimum required length
   * @returns True if string meets minimum length
   */
  minLength(str: string, min: number): boolean {
    return str.length >= min;
  },

  /**
   * Validates maximum string length.
   * 
   * @param str - String to validate
   * @param max - Maximum allowed length
   * @returns True if string doesn't exceed maximum length
   */
  maxLength(str: string, max: number): boolean {
    return str.length <= max;
  },

  /**
   * Validates number is within specified range.
   * 
   * @param num - Number to validate
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns True if number is within range
   */
  range(num: number, min: number, max: number): boolean {
    return num >= min && num <= max;
  }
};

/**
 * Asynchronous operation utilities for Promise management and control flow.
 * 
 * @remarks
 * Provides utilities for common async patterns including delays, timeouts,
 * and retry logic with exponential backoff. Useful for API calls, database
 * operations, and other async tasks that may fail or need timing control.
 * 
 * @example
 * ```typescript
 * // Simple delay
 * await async.sleep(1000); // Wait 1 second
 * 
 * // Timeout protection
 * try {
 *   const result = await async.timeout(apiCall(), 5000);
 * } catch (error) {
 *   console.log('API call timed out');
 * }
 * 
 * // Retry with backoff
 * const data = await async.retry(
 *   () => fetchDataFromAPI(),
 *   3,    // max attempts
 *   1000  // base delay
 * );
 * ```
 * 
 * @namespace async
 * @public
 * @since 0.1.0
 */
export const async = {
  /**
   * Creates a delay for the specified number of milliseconds.
   * 
   * @param ms - Milliseconds to sleep
   * @returns Promise that resolves after the delay
   */
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Adds a timeout to a Promise, rejecting if it takes too long.
   * 
   * @param promise - Promise to add timeout to
   * @param ms - Timeout in milliseconds
   * @returns Promise that resolves/rejects with the original promise or timeout
   * @throws Error if the operation times out
   */
  timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
      )
    ]);
  },

  /**
   * Retries a function with exponential backoff on failure.
   * 
   * @param fn - Async function to retry
   * @param maxAttempts - Maximum number of attempts (default: 3)
   * @param baseDelay - Base delay in milliseconds for exponential backoff (default: 1000)
   * @returns Promise that resolves with the function result
   * @throws The last error if all attempts fail
   */
  async retry<T>(
    fn: () => Promise<T>, 
    maxAttempts = 3, 
    baseDelay = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }
};

/**
 * Object manipulation utilities for common object operations.
 * 
 * @remarks
 * Provides utilities for object manipulation including cloning, property
 * selection, and common object operations. These functions help with
 * data transformation and object management tasks.
 * 
 * @example
 * ```typescript
 * const user = { id: 1, name: 'John', email: 'john@example.com', password: 'secret' };
 * 
 * // Clone object
 * const userCopy = object.clone(user);
 * 
 * // Pick specific properties
 * const publicUser = object.pick(user, ['id', 'name', 'email']);
 * 
 * // Remove sensitive properties
 * const safeUser = object.omit(user, ['password']);
 * 
 * // Check if object is empty
 * if (object.isEmpty(filters)) {
 *   // No filters applied
 * }
 * ```
 * 
 * @namespace object
 * @public
 * @since 0.1.0
 */
export const object = {
  /**
   * Creates a deep clone of an object using JSON serialization.
   * 
   * @param obj - Object to clone
   * @returns Deep clone of the object
   * 
   * @remarks
   * Note: This method uses JSON.parse/stringify, so it won't preserve
   * functions, undefined values, symbols, or circular references.
   */
  clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Creates a new object with only the specified keys.
   * 
   * @param obj - Source object
   * @param keys - Array of keys to pick
   * @returns New object with only the specified keys
   */
  pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  /**
   * Creates a new object excluding the specified keys.
   * 
   * @param obj - Source object
   * @param keys - Array of keys to omit
   * @returns New object without the specified keys
   */
  omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  },

  /**
   * Checks if an object has no enumerable properties.
   * 
   * @param obj - Object to check
   * @returns True if object is empty
   */
  isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
  }
};

/**
 * String manipulation utilities for common text operations.
 * 
 * @remarks
 * Provides utilities for string transformation including case conversion,
 * truncation, and formatting. Useful for data processing, API responses,
 * and user interface text formatting.
 * 
 * @example
 * ```typescript
 * // Case conversions
 * const apiEndpoint = string.camelCase('user-profile-settings'); // 'userProfileSettings'
 * const cssClass = string.kebabCase('UserProfileComponent'); // 'user-profile-component'
 * const dbColumn = string.snakeCase('createdAt'); // 'created_at'
 * 
 * // Text formatting
 * const title = string.capitalize('john doe'); // 'John doe'
 * const preview = string.truncate(longText, 100); // 'Long text content...'
 * ```
 * 
 * @namespace string
 * @public
 * @since 0.1.0
 */
export const string = {
  /**
   * Converts string to camelCase format.
   * 
   * @param str - String to convert
   * @returns String in camelCase format
   */
  camelCase(str: string): string {
    return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
  },

  /**
   * Converts string to kebab-case format.
   * 
   * @param str - String to convert
   * @returns String in kebab-case format
   */
  kebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[_\s]+/g, '-')
      .toLowerCase();
  },

  /**
   * Converts string to snake_case format.
   * 
   * @param str - String to convert
   * @returns String in snake_case format
   */
  snakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[-\s]+/g, '_')
      .toLowerCase();
  },

  /**
   * Capitalizes the first letter of a string.
   * 
   * @param str - String to capitalize
   * @returns String with first letter capitalized
   */
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Truncates string to specified length with optional suffix.
   * 
   * @param str - String to truncate
   * @param length - Maximum length
   * @param suffix - Suffix to add when truncated (default: '...')
   * @returns Truncated string with suffix if needed
   */
  truncate(str: string, length: number, suffix = '...'): string {
    if (str.length <= length) return str;
    return str.slice(0, length - suffix.length) + suffix;
  }
};
