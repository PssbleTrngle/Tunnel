import type {
  ProxiedResponse,
  RequestOptions,
} from "@pssbletrngle/tunnel-contract";

export default async function request({
  port,
  pathname,
  headers,
  method,
  body,
  state,
}: RequestOptions & { port: number }) {
  const url = new URL(pathname, `http://localhost:${port}`);
  const response = await fetch(url, { body, method, headers });

  return {
    headers: response.headers.toJSON(),
    status: response.status,
    body: await response.text(),
    state,
  } satisfies ProxiedResponse;
}
