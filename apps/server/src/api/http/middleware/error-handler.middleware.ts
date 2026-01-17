import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.message,
      code: error.code
    });
  }

  // Neo4j errors
  if (error.name === 'Neo4jError') {
    return reply.status(500).send({
      error: 'Database error',
      code: 'DB_ERROR'
    });
  }

  // Default error
  return reply.status(500).send({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
}
