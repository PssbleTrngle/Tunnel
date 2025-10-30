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
  console.info("registering tunnel");

  if (instance) {
    if (replace) {
      instance.close();
    } else {
      socket.close(
        SocketCode.ALREADY_CONNECTED,
        "another client is already connected"
      );
    }
  }

  instance = createTunnel(socket);
  console.info("websocket connected");
}

export function closeTunnel() {
  instance?.close();
  instance = null;
}
