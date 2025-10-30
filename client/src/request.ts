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
}: WithoutState<RequestOptions> & { port: number }) {
  const url = new URL(pathname, `http://localhost:${port}`);
  const response = await fetch(url, { body, method, headers });

  return {
    headers: response.headers.toJSON(),
    status: response.status,
    body: await response.text(),
  } satisfies WithoutState<ProxiedResponse>;
}
