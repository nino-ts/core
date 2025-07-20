/**
 * @fileoverview NinoTS Request Context implementation
 * @module @ninots/core/context
 * @since 0.1.0
 */

import type { HttpMethod, NinoContext } from './types';

/**
 * NinoTS Request Context implementation that provides access to request data and response helpers.
 * 
 * @remarks
 * The Context class implements the NinoContext interface and serves as the primary way
 * to interact with HTTP requests and create responses in NinoTS applications.
 * It automatically parses request bodies based on Content-Type headers and provides
 * convenient methods for creating different types of responses.
 * 
 * @example
 * ```typescript
 * // Typically used within route handlers
 * app.get('/users/:id', (ctx: Context) => {
 *   const userId = ctx.params.id;
 *   const userData = await getUserById(userId);
 *   return ctx.json(userData);
 * });
 * 
 * app.post('/users', (ctx: Context) => {
 *   const newUser = ctx.body as CreateUserData;
 *   const savedUser = await createUser(newUser);
 *   return ctx.status(201).json(savedUser);
 * });
 * ```
 * 
 * @public
 * @since 0.1.0
 */
export class Context implements NinoContext {
  /** Parsed URL object from the request */
  public readonly url: URL;
  
  /** HTTP method of the request */
  public readonly method: HttpMethod;
  
  /** Request headers */
  public readonly headers: Headers;
  
  /** Route parameters extracted from URL path patterns */
  public readonly params: Record<string, string> = {};
  
  /** Query string parameters parsed from URL */
  public readonly query: Record<string, string> = {};
  
  /** Shared state object for middleware communication */
  public readonly state: Record<string, any> = {};
  
  /** Cached parsed body content */
  private _body: unknown = null;
  
  /** Flag indicating if body has been parsed */
  private _bodyParsed = false;
  
  /** Response status code */
  private _status = 200;
  
  /** Response headers collection */
  private _headers = new Headers();

  /**
   * Creates a new Context instance from a Web API Request.
   * 
   * @param request - The Web API Request object
   * 
   * @remarks
   * The constructor automatically parses the URL and query parameters.
   * Body parsing is deferred until the body getter is accessed.
   * 
   * @example
   * ```typescript
   * const context = new Context(request);
   * console.log(context.method); // 'GET'
   * console.log(context.url.pathname); // '/users/123'
   * console.log(context.query.page); // '1'
   * ```
   * 
   * @since 0.1.0
   */
  constructor(public readonly request: Request) {
    this.url = new URL(request.url);
    this.method = request.method as HttpMethod;
    this.headers = request.headers;
    
    // Parse query parameters from URL search params
    for (const [key, value] of this.url.searchParams.entries()) {
      this.query[key] = value;
    }
  }

  /**
   * Gets the parsed request body, automatically parsing based on Content-Type.
   * 
   * @returns The parsed body content
   * 
   * @remarks
   * The body is parsed lazily on first access and cached for subsequent calls.
   * Parsing behavior depends on the Content-Type header:
   * - `application/json`: Parsed as JSON object
   * - `application/x-www-form-urlencoded`: Parsed as key-value object
   * - `multipart/form-data`: Returns FormData object
   * - `text/*`: Returns string
   * - Other types: Returns ArrayBuffer
   * 
   * @example
   * ```typescript
   * // JSON body
   * const jsonData = ctx.body as { name: string, email: string };
   * 
   * // Form data
   * const formData = ctx.body as FormData;
   * const file = formData.get('avatar') as File;
   * 
   * // Text body
   * const textContent = ctx.body as string;
   * ```
   * 
   * @since 0.1.0
   */
  get body(): unknown {
    if (!this._bodyParsed) {
      this._parseBody();
    }
    return this._body;
  }

  /**
   * Parses the request body based on the Content-Type header.
   * 
   * @private
   * @returns Promise that resolves when parsing is complete
   * 
   * @remarks
   * This method is called internally when the body getter is first accessed.
   * It handles different content types and caches the result to avoid re-parsing.
   * If parsing fails, the body is set to null.
   * 
   * @since 0.1.0
   */
  private async _parseBody(): Promise<void> {
    if (this._bodyParsed) return;
    
    const contentType = this.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('application/json')) {
        this._body = await this.request.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await this.request.formData();
        const body: Record<string, any> = {};
        for (const [key, value] of formData.entries()) {
          body[key] = value;
        }
        this._body = body;
      } else if (contentType.includes('multipart/form-data')) {
        this._body = await this.request.formData();
      } else if (contentType.includes('text/')) {
        this._body = await this.request.text();
      } else {
        this._body = await this.request.arrayBuffer();
      }
    } catch (error) {
      this._body = null;
    }
    
    this._bodyParsed = true;
  }

  /**
   * Sets the HTTP status code for the response.
   * 
   * @param code - HTTP status code (e.g., 200, 404, 500)
   * @returns This context instance for method chaining
   * 
   * @example
   * ```typescript
   * return ctx.status(201).json({ created: true });
   * return ctx.status(404).text('Not Found');
   * return ctx.status(500).json({ error: 'Internal Server Error' });
   * ```
   * 
   * @since 0.1.0
   */
  status(code: number): NinoContext {
    this._status = code;
    return this;
  }

  /**
   * Sets a response header.
   * 
   * @param name - Header name (case-insensitive)
   * @param value - Header value
   * @returns This context instance for method chaining
   * 
   * @example
   * ```typescript
   * return ctx
   *   .header('X-API-Version', '1.0')
   *   .header('Cache-Control', 'no-cache')
   *   .json(data);
   * ```
   * 
   * @since 0.1.0
   */
  header(name: string, value: string): NinoContext {
    this._headers.set(name, value);
    return this;
  }

  /**
   * Creates a JSON response with automatic serialization.
   * 
   * @param data - Data to be serialized as JSON
   * @param init - Optional ResponseInit for additional configuration
   * @returns Response object with application/json content-type
   * 
   * @example
   * ```typescript
   * // Simple JSON response
   * return ctx.json({ message: 'Success' });
   * 
   * // With custom status
   * return ctx.status(201).json({ id: newUser.id });
   * 
   * // With additional response options
   * return ctx.json(data, { 
   *   headers: { 'X-Custom': 'value' } 
   * });
   * ```
   * 
   * @since 0.1.0
   */
  json(data: any, init?: ResponseInit): Response {
    const headers = new Headers(this._headers);
    headers.set('content-type', 'application/json');
    
    return new Response(JSON.stringify(data), {
      status: this._status,
      headers,
      ...init
    });
  }

  /**
   * Creates a plain text response.
   * 
   * @param text - Text content for the response
   * @param init - Optional ResponseInit for additional configuration
   * @returns Response object with text/plain content-type
   * 
   * @example
   * ```typescript
   * return ctx.text('Hello, World!');
   * return ctx.status(404).text('Resource not found');
   * ```
   * 
   * @since 0.1.0
   */
  text(text: string, init?: ResponseInit): Response {
    const headers = new Headers(this._headers);
    headers.set('content-type', 'text/plain');
    
    return new Response(text, {
      status: this._status,
      headers,
      ...init
    });
  }

  /**
   * Creates an HTML response.
   * 
   * @param html - HTML content for the response
   * @param init - Optional ResponseInit for additional configuration
   * @returns Response object with text/html content-type
   * 
   * @example
   * ```typescript
   * return ctx.html('<h1>Welcome</h1>');
   * return ctx.html(`
   *   <!DOCTYPE html>
   *   <html>
   *     <head><title>My App</title></head>
   *     <body><h1>${data.title}</h1></body>
   *   </html>
   * `);
   * ```
   * 
   * @since 0.1.0
   */
  html(html: string, init?: ResponseInit): Response {
    const headers = new Headers(this._headers);
    headers.set('content-type', 'text/html');
    
    return new Response(html, {
      status: this._status,
      headers,
      ...init
    });
  }

  /**
   * Creates a redirect response.
   * 
   * @param url - URL to redirect to (can be relative or absolute)
   * @param status - HTTP redirect status code (default: 302)
   * @returns Response object with Location header set
   * 
   * @example
   * ```typescript
   * // Temporary redirect (302)
   * return ctx.redirect('/login');
   * 
   * // Permanent redirect (301)
   * return ctx.redirect('/new-path', 301);
   * 
   * // External redirect
   * return ctx.redirect('https://example.com');
   * ```
   * 
   * @since 0.1.0
   */
  redirect(url: string, status = 302): Response {
    const headers = new Headers(this._headers);
    headers.set('location', url);
    
    return new Response(null, {
      status,
      headers
    });
  }
}
