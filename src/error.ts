import type { StatusMap } from "elysia";

type HttpStatus = keyof StatusMap | StatusMap[keyof StatusMap];

export class HttpError extends Error {
  constructor(
    public readonly status: HttpStatus,
    public readonly message: string,
  ) {
    super(message);
  }
}
