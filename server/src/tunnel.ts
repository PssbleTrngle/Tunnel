import {
  SocketCode,
  type ProxiedResponse,
  type RequestOptions,
  type WithoutState,
} from "@possible_triangle/tunnel-contract";
import type { ServerWebSocket } from "bun";
import { nanoid } from "nanoid";
import { EventEmitter } from "node:events";
import type { SessionData } from "./auth";

export type Tunnel = {
  forward(request: WithoutState<RequestOptions>): Promise<Response>;
  handle(response: ProxiedResponse): void;
  close(): void;
  is(socket: ServerWebSocket<SessionData>): void;
};

type EventSubject<K extends ProxiedResponse["type"]> = Omit<
  ProxiedResponse & { type: K },
  "type" | "state"
>;

type ResponseEvents = {
  [K in ProxiedResponse["type"]]: [EventSubject<K>];
};

async function nextEvent<T extends keyof ResponseEvents>(
  emitter: EventEmitter<ResponseEvents>,
  key: T,
) {
  return new Promise<EventSubject<T>>((res, rej) => {
    emitter.once(key, res as any);
    emitter.once("done", rej);
  });
}

export function createTunnel(socket: ServerWebSocket<SessionData>): Tunnel {
  const emitters = new Map<string, EventEmitter<ResponseEvents>>();

  return {
    async forward(request) {
      const state = nanoid();

      socket.send(JSON.stringify({ ...request, state }));

      const emitter = new EventEmitter<ResponseEvents>();
      emitters.set(state, emitter);

      const headers = await nextEvent(emitter, "headers");

      async function* data() {
        while (true) {
          try {
            const { data } = await nextEvent(emitter, "data");
            yield data;
          } catch {
            emitters.delete(state);
            console.log("received done");
            break;
          }
        }
      }

      return new Response(data, headers);
    },
    close() {
      socket.close(
        SocketCode.OTHER_CLIENT_CONNECTED,
        "another client has connected",
      );
    },
    handle({ state, type, ...response }) {
      const emitter = emitters.get(state);
      if (!emitter) console.log("consumer got lost for request", state);
      else emitter.emit(type, response as any);
    },

    is(other) {
      return socket === other;
    },
  };
}
