import {
  SocketCode,
  type Headers,
  type RequestOptions,
} from "@possible_triangle/tunnel-contract";
import type { Options } from "./cli/options";
import request from "./request";
import executeWithRetries, { type RetryContext } from "./retry";

const messages: Record<SocketCode, string> = {
  [SocketCode.ALREADY_CONNECTED]: "another client is already connected",
  [SocketCode.INVALID_SECRET]: "invalid secret passed",
  [SocketCode.MISSING_SECRET]: "server requires secret, none passed",
  [SocketCode.OTHER_CLIENT_CONNECTED]:
    "another client has been connected instead",
};

export const connect = executeWithRetries(
  (
    { target, secret, host, port, userAgent }: Options & { userAgent?: string },
    context: RetryContext
  ) => {
    const verb = context.attempt > 1 ? "reconnecting" : "connecting";
    const url = new URL(target);
    url.protocol = url.protocol === "https:" ? "wss" : "ws";
    console.info(`${verb} to ${url} ...`);

    const headers: Headers = {};
    if (secret) headers["Authorization"] = `Secret ${secret}`;
    if (userAgent) headers["User-Agent"] = userAgent;

    const socket = new WebSocket(url, { headers });

    socket.addEventListener("ping", () => {
      context.reset();
      console.info("connected successfully");
    });

    socket.addEventListener("message", async (event) => {
      const { state, ...data }: RequestOptions = JSON.parse(event.data);
      console.info(
        `${data.method} request '${state}' received for ${data.pathname}`
      );
      const response = await request({ ...data, port, host });
      socket.send(JSON.stringify({ ...response, state }));
    });

    return new Promise<void>((resolve, reject) => {
      socket.addEventListener("close", ({ code, reason }) => {
        const message = messages[code as SocketCode] ?? `[${code}]: ${reason}`;
        console.warn("connection closed:", message);

        if (code === SocketCode.OTHER_CLIENT_CONNECTED) resolve();
        else reject(new Error(reason));
      });

      socket.addEventListener("error", () => {
        reject(new Error(`socket enountered error`));
      });
    });
  }
);
