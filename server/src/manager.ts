import { SocketCode } from "@possible_triangle/tunnel-contract";
import type { ServerWebSocket } from "bun";
import type { SessionData } from "./auth";
import { createTunnel, type Tunnel } from "./tunnel";

let instance: Tunnel | null = null;

export async function getTunnel() {
  return instance;
}

export async function registerTunnel(
  socket: ServerWebSocket<SessionData>,
  replace: boolean = false
) {
  if (instance) {
    if (replace) {
      instance.close();
    } else {
      socket.close(
        SocketCode.ALREADY_CONNECTED,
        "another client is already connected"
      );

      return;
    }
  }

  instance = createTunnel(socket);
  socket.ping();
  console.info("websocket connected");
}

export function closeTunnel(socket: ServerWebSocket<SessionData>) {
  if (instance?.is(socket)) {
    instance = null;
  }
}
