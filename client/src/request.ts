import type {
  Headers,
  ProxiedResponse,
  RequestOptions,
  WithoutState,
} from "@possible_triangle/tunnel-contract";

function adaptHeaders(headers: Headers, host: string) {
  return {
    ...headers,
    host,
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
  const url = new URL(pathname + search, `http://${host}:${port}`);

  const response = await fetch(url, {
    body,
    method,
    headers: adaptHeaders(headers, host),
    redirect: "manual",
  });

  return {
    headers: response.headers.toJSON(),
    status: response.status,
    body: await response.text(),
  } satisfies WithoutState<ProxiedResponse>;
}
