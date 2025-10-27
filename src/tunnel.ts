import type { ClientRequestArgs } from "http";
import { Agent } from "node:http";
import { createServer, Socket, type AddressInfo } from "node:net";
import type { Duplex } from "stream";

export type TunnelServerOptions = {
  maxSockets: number;
};

export default class TunnelAgent extends Agent {
  private socket: Socket | null = null;
  private readonly server = createServer();

  constructor() {
    super({ keepAlive: true });

    this.on("close", () => {
      this.socket?.emit("close");
      this.server.close();
    });

    this.on("error", (error) => console.error(error));

    this.server.on("connection", (socket) => {
      if (this.socket) {
        console.warn("already a tunnel connected");
        socket.destroy();
        return false;
      }

      const { address, port } = socket.address() as AddressInfo;

      console.info(`client connected at ${address}:${port}`);

      socket.once("close", () => {
        console.info("client socket closed");
        this.emit("close");
      });

      socket.on("error", (error) => {
        console.error(error);
        socket.destroy();
      });

      this.socket = socket;
    });

    this.server.on("error", (error) => this.emit("error", error));
    this.server.on("close", () => console.log("tunnel server closed"));

    this.server.listen();
  }

  get port() {
    const address = this.server.address() as AddressInfo;
    return address.port;
  }

  override createConnection(
    _: ClientRequestArgs,
    callback?: (err: Error | null, stream: Duplex) => void
  ) {
    if (!this.socket) {
      console.warn("no client connected yet");
      return;
    }

    console.info("forwarding to socket");
    callback?.(null, this.socket);
    return this.socket;
  }
}
