import {
  SocketCode,
  type ProxiedResponse,
  type RequestOptions,
  type WithoutState,
} from "@possible_triangle/tunnel-contract";
import type { ServerWebSocket } from "bun";
import { nanoid } from "nanoid";
import type { SessionData } from "./auth";

export type Tunnel = {
  forward(
    request: WithoutState<RequestOptions>
  ): Promise<WithoutState<ProxiedResponse>>;
  handle(response: ProxiedResponse): void;
  close(): void;
  is(socket: ServerWebSocket<SessionData>): void;
};

type Consumer = (response: WithoutState<ProxiedResponse>) => void;

export function createTunnel(socket: ServerWebSocket<SessionData>): Tunnel {
  const consumers = new Map<string, Consumer>();

  return {
    async forward(request) {
      const state = nanoid();

      socket.send(JSON.stringify({ ...request, state }));

      return new Promise<WithoutState<ProxiedResponse>>((res) => {
        consumers.set(state, res);
      });
    },
    close() {
      socket.close(
        SocketCode.OTHER_CLIENT_CONNECTED,
        "another client has connected"
      );
    },
    handle({ state, ...response }) {
      const consumer = consumers.get(state);
      console.log("consumer got lost for request", state);
      consumer?.(response);
    },

    is(other) {
      return socket === other;
    },
  };
}
