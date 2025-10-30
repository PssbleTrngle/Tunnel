import type { ProxiedResponse } from "@possible_triangle/tunnel-contract";
import { createSession, validateSession, type SessionData } from "./auth";
import config from "./config";
import { ServerError } from "./error";
import { closeTunnel, getTunnel, registerTunnel } from "./manager";

const server = Bun.serve<SessionData>({
  port: config.port,
  websocket: {
    async message(_, message) {
      const data: ProxiedResponse = JSON.parse(message.toString());
      console.log(
        "received response for",
        data.state,
        "with status",
        data.status
      );

      const tunnel = await getTunnel();
      tunnel?.handle(data);
    },
    async open(socket) {
      if (await validateSession(socket)) {
        await registerTunnel(socket, false);
      }
    },
    close(_socket, _code, message) {
      console.log("connected disconnected:", message);
      closeTunnel();
    },
  },
  async fetch(req, server) {
    if (
      server.upgrade(req, {
        data: await createSession(req),
      })
    )
      return;

    const tunnel = await getTunnel();
    if (!tunnel) throw new ServerError("no tunnel registered yet", 404);

    const { pathname } = new URL(req.url);
    console.info(`Forwarding ${req.method} ${pathname}`);

    const response = await tunnel.forward({
      headers: req.headers.toJSON(),
      pathname,
      method: req.method,
      body: await req.body?.text(),
    });

    return new Response(response.body, {
      headers: response.headers,
      status: response.status,
    });
  },
  error(error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }

    const status = error instanceof ServerError ? error.status : 500;
    return Response.json({ message: error.message }, { status });
  },
});

console.info(`listening on ${server.url}`);
if (config.secret) console.info("using secret key");
