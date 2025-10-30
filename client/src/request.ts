import type {
  ProxiedResponse,
  RequestOptions,
  WithoutState,
} from "@possible_triangle/tunnel-contract";

export default async function request({
  port,
  pathname,
  headers,
  method,
  body,
  host,
}: WithoutState<RequestOptions> & { port: number; host: string }) {
  const url = new URL(pathname, `http://${host}:${port}`);
  const response = await fetch(url, { body, method, headers });

  return {
    headers: response.headers.toJSON(),
    status: response.status,
    body: await response.text(),
  } satisfies WithoutState<ProxiedResponse>;
}
