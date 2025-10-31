export type Headers = Record<string, string>;

export type WithoutState<T> = Omit<T, "state">;

export type RequestOptions = {
  state: string;
  pathname: string;
  headers: Headers;
  method: string;
  search?: string;
  body?: string;
};

export type ProxiedResponse = {
  state: string;
  headers: Headers;
  body: string;
  status: number;
};

export const enum SocketCode {
  ALREADY_CONNECTED = 4001,
  OTHER_CLIENT_CONNECTED = 4002,
  MISSING_SECRET = 4003,
  INVALID_SECRET = 4004,
}
