export type Headers = Record<string, string>;

export type WithoutState<T> = Omit<T, "state">;

export type RequestOptions = {
  state: string;
  pathname: string;
  headers: Headers;
  method: string;
  body?: string;
};

export type ProxiedResponse = {
  state: string;
  headers: Headers;
  body: string;
  status: number;
};
