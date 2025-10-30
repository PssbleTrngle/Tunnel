import { SocketCode } from "@possible_triangle/tunnel-contract";
import type { ServerWebSocket } from "bun";
import config from "./config";
import { ServerError } from "./error";

export type SessionData = { secret?: string };

export async function createSession(req: Request): Promise<SessionData> {
  const header = req.headers.get("Authorization");
  if (!header) return {};

  const [type, key] = header;
  if (!type || !key) throw new ServerError("invalid authorization", 401);

  if (type.toLowerCase() === "secret") {
    return {
      secret: key,
    };
  }

  throw new ServerError(`'${type}' authorization flow is not supported`, 401);
}

export async function validateSession(socket: ServerWebSocket<SessionData>) {
  if (!config.secret) return true;

  if (!socket.data.secret) {
    socket.close(SocketCode.MISSING_SECRET, "secret missing");
    return false;
  }

  if (config.secret !== socket.data.secret) {
    socket.close(SocketCode.INVALID_SECRET, "invalid secret");
    return false;
  }

  return true;
}
