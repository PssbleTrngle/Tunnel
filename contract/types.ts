export type Headers = Record<string, string>;

type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

export type WithoutState<T> = DistributiveOmit<T, "state">;

export type RequestOptions = {
  state: string;
  pathname: string;
  headers: Headers;
  method: string;
  search?: string;
  body?: string;
};

export type HeaderResponse = {
  type: "headers";
  headers: Headers;
  status: number;
};

export type DataResponse = {
  type: "data";
  data: string;
};

export type DoneResponse = {
  type: "done";
};

export type ProxiedResponse = (HeaderResponse | DataResponse | DoneResponse) & {
  state: string;
};

export const enum SocketCode {
  ALREADY_CONNECTED = 4001,
  OTHER_CLIENT_CONNECTED = 4002,
  MISSING_SECRET = 4003,
  INVALID_SECRET = 4004,
}
