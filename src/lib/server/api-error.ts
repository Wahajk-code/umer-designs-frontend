import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { BackendError } from '@/lib/server/backend-client';

/** Consistent {statusCode, error, message} shape for every BFF route, mirroring the backend's. */
export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof BackendError) {
    return NextResponse.json(
      { statusCode: err.statusCode, error: 'Error', message: err.message },
      { status: err.statusCode },
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        statusCode: 400,
        error: 'Bad Request',
        message: err.issues.map((issue) => issue.message),
      },
      { status: 400 },
    );
  }
  return NextResponse.json(
    { statusCode: 500, error: 'Internal Server Error', message: 'Something went wrong. Please try again.' },
    { status: 500 },
  );
}
