export class ServerError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}
