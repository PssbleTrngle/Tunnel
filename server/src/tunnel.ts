import type {
  ProxiedResponse,
  RequestOptions,
  WithoutState,
} from "@pssbletrngle/tunnel-contract";
import type { ServerWebSocket } from "bun";
import { nanoid } from "nanoid";

export type Tunnel = {
  forward(
    request: WithoutState<RequestOptions>
  ): Promise<WithoutState<ProxiedResponse>>;
  handle(response: ProxiedResponse): void;
  close(): void;
};

type Consumer = (response: WithoutState<ProxiedResponse>) => void;

export function createTunnel(socket: ServerWebSocket): Tunnel {
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
      socket.close(1014, "another client has connected");
    },
    handle({ state, ...response }) {
      const consumer = consumers.get(state);
      console.log("consumer got lost for request", state);
      consumer?.(response);
    },
  };
}
