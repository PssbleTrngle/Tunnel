import type {
  Headers,
  ProxiedResponse,
  RequestOptions,
  WithoutState,
} from "@possible_triangle/tunnel-contract";
import { StringDecoder } from "node:string_decoder";

function adaptHeaders(headers: Headers, url: URL) {
  const { host, origin } = url;
  return {
    ...headers,
    host,
    origin,
  };
}

export default async function request(
  {
    port,
    pathname,
    search = "",
    headers,
    method,
    body,
    host,
  }: WithoutState<RequestOptions> & { port: number; host: string },
  send: (reponse: WithoutState<ProxiedResponse>) => void,
) {
  const origin = `${host}:${port}`;
  const url = new URL(pathname + search, `http://${origin}`);

  const response = await fetch(url, {
    body,
    method,
    headers: adaptHeaders(headers, url),
    redirect: "manual",
  });

  send({
    type: "headers",
    headers: response.headers.toJSON(),
    status: response.status,
  });

  if (!response.body) return;

  for await (const chunk of response.body) {
    const data = new StringDecoder().write(chunk);

    send({
      type: "data",
      data,
    });
  }

  send({
    type: "done",
  });
}
