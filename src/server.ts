import http, { IncomingMessage, type RequestOptions } from "node:http";
import { getTunnelAgent, registerTunnel } from "./manager";

class ServerError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

async function readBody(message: IncomingMessage) {
  return new Promise<Buffer>((resolve, reject) => {
    const bodyParts: Uint8Array[] = [];
    message.on("data", (chunk) => {
      bodyParts.push(chunk);
    });
    message.on("end", () => {
      const body = Buffer.concat(bodyParts);
      resolve(body);
    });
    message.on("error", (e) => reject(e));
  });
}

function request(options: RequestOptions) {
  return new Promise<Response>((resolve, reject) => {
    const request = http.request(options, async (message) => {
      console.info(`received response from ${message.url}`);
      const body = await readBody(message);
      const response = new Response(body, {
        headers: message.headers as Record<string, string>,
        status: message.statusCode,
      });
      resolve(response);
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

    const host = "example.com";
    return request({
      host,
      protocol: "http:",
      path: "/",
      method: req.method,
      headers: {
        ...req.headers.toJSON(),
        host,
      },
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
