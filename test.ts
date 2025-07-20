#!/usr/bin/env bun

import { createApp } from "./index.ts";

console.log("Creating NinoTS app...");

const app = createApp({
	port: 3001,
	development: true,
});

app.get("/", (ctx) => {
	console.log("Root route called");
	return ctx.json({ message: "NinoTS is working!" });
});

console.log("Starting server...");
app.listen();
