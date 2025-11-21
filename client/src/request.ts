import type {
  Headers,
  ProxiedResponse,
  RequestOptions,
  WithoutState,
} from "@possible_triangle/tunnel-contract";

function adaptHeaders(headers: Headers, url: URL) {
  const { host, origin } = url;
  return {
    ...headers,
    host,
    origin,
  };
}

export default async function request({
  port,
  pathname,
  search = "",
  headers,
  method,
  body,
  host,
}: WithoutState<RequestOptions> & { port: number; host: string }) {
  const origin = `${host}:${port}`;
  const url = new URL(pathname + search, `http://${origin}`);

  const response = await fetch(url, {
    body,
    method,
    headers: adaptHeaders(headers, url),
    redirect: "manual",
  });

  return {
    headers: response.headers.toJSON(),
    status: response.status,
    body: await response.text(),
  } satisfies WithoutState<ProxiedResponse>;
}
