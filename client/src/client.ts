import type { RequestOptions } from "@pssbletrngle/tunnel-contract";
import type { Options } from "./cli/options";
import request from "./request";
import executeWithRetries, { type RetryContext } from "./retry";

export const connect = executeWithRetries(
  ({ host, port }: Options, context: RetryContext) => {
    const verb = context.attempt > 1 ? "reconnecting" : "connecting";
    console.info(`${verb} to ${host}...`);

    const socket = new WebSocket(`ws://${host}/tunnel`);

    socket.addEventListener("message", async (event) => {
      const data: RequestOptions = JSON.parse(event.data);
      console.info(
        data.method,
        "request ",
        data.state,
        " received for",
        data.pathname
      );
      const response = await request({ ...data, port });
      socket.send(JSON.stringify(response));
    });

    socket.addEventListener("open", (event) => {
      context.reset();
      console.info("connected successfully");
    });

    return new Promise<void>((_, reject) => {
      socket.addEventListener("close", (event) => {
        console.warn("connection closed:", event.reason);
        reject(new Error(event.reason));
      });

      socket.addEventListener("error", () => {
        reject(new Error(`socket enountered error`));
      });
    });
  }
);
