export type ApiErrorPayload = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export class HttpError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function ok<T>(data: T, status: number = 200) {
  return Response.json(data, { status });
}

export function bad(
  message: string,
  details?: unknown,
  status: number = 400,
  code?: string
) {
  const resolvedCode =
    code ?? (status >= 500 ? "INTERNAL_ERROR" : "BAD_REQUEST");

  return Response.json(
    {
      error: {
        code: resolvedCode,
        message,
        details,
      },
    } satisfies ApiErrorPayload,
    { status }
  );
}

export function handleRouteError(err: unknown) {
  if (err instanceof HttpError) {
    return bad(err.message, err.details, err.status, err.code);
  }

  if (err instanceof Error) {
    return bad(err.message, null, 500, "INTERNAL_ERROR");
  }

  return bad("Internal error", null, 500, "INTERNAL_ERROR");
}
