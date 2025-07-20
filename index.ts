// NinoTS - Modern TypeScript Backend Framework for Bun
// Main entry point

export * from "./src/app";
// Re-export commonly used items for convenience
export {
	createApp,
	NinoApp,
} from "./src/app";
export * from "./src/context";
export { Context } from "./src/context";
export * from "./src/decorators";
export {
	Body,
	Controller,
	Ctx,
	Delete,
	Get,
	Head,
	Options,
	Param,
	Patch,
	Post,
	Put,
	Query,
	UseMiddleware,
} from "./src/decorators";
export * from "./src/middleware";
export {
	cors,
	errorHandler,
	json,
	logger,
	rateLimit,
	staticFiles,
} from "./src/middleware";
export * from "./src/router";
export { Router } from "./src/router";
export type {
	ErrorHandler,
	HttpMethod,
	Middleware,
	NinoConfig,
	NinoContext,
	Route,
	RouteHandler,
	RouterConfig,
} from "./src/types";
export * from "./src/types";
export * from "./src/utils";
export {
	async,
	env,
	HttpStatus,
	MimeType,
	object,
	string,
	validate,
} from "./src/utils";
