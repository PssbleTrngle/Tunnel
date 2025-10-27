import http, { type RequestOptions } from "node:http";
import { getTunnelAgent, registerTunnel } from "./manager";

class ServerError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

function request(options: RequestOptions) {
  return new Promise<Response>((resolve, reject) => {
    const request = http.request(options, (message) => {
      console.info(`received response from ${message.url}`);
      new Response(message, {
        headers: message.headers,
        status: message.statusCode,
      });
      resolve(new Response(undefined, message));
    });

    request.on("timeout", () =>
      request.emit("error", new Error("request timed out"))
    );

    request.on("error", (error) => reject(new ServerError(error.message, 504)));

    request.end();
  });
}

const server = Bun.serve({
  development: { console: true },
  port: 8080,
  routes: {
    "/tunnel/": {
      GET: async (req) => {
        const { searchParams } = new URL(req.url);
        const replace = searchParams.get("replace") === "true";
        const created = await registerTunnel(replace);
        return Response.json(created);
      },
    },
  },
  async fetch(req) {
    const agent = await getTunnelAgent();
    if (!agent) throw new ServerError("no tunnel registered yet", 404);

    const { pathname } = new URL(req.url);
    console.info(`Forwarding ${req.method} ${pathname}`);

    return request({
      path: "https://example.com",
      method: req.method,
      headers: req.headers.toJSON(),
      agent,
      timeout: 9 * 1000,
    });
  },
  error(error) {
    const status = error instanceof ServerError ? error.status : 500;
    return Response.json({ message: error.message }, { status });
  },
});

console.log(`listening on ${server.url}`);
