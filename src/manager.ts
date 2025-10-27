import TunnelAgent from "./tunnel";

let tunnels: TunnelAgent | null = null;

export async function getTunnelAgent() {
  return tunnels;
}

export async function registerTunnel(replace: boolean = false) {
  console.info("registering tunnel");

  const id = "unique";
  const host = "localhost";
  const url = "http://localhost:8080";

  if (tunnels) {
    tunnels.emit("close");
  }

  tunnels = new TunnelAgent();
  console.info(`tunnel server created with port ${tunnels.port}`);

  tunnels.on("close", () => {
    tunnels = null;
  });

  return { id, host, port: tunnels.port, url, max_conn_count: 1 };
}
