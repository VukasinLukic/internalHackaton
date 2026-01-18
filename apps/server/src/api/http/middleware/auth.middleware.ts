import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from './error-handler.middleware';

// Simplified auth for hackathon - just extract user ID from header
// In production, use Clerk SDK to verify JWT

export interface AuthenticatedRequest extends FastifyRequest {
  userId: string;
  userRole: 'provider' | 'seeker';
}

export async function authMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  // For hackathon: use simple header-based auth
  // Header: X-User-Id: user-123
  // Header: X-User-Role: seeker

  const userId = request.headers['x-user-id'] as string;
  const userRole = request.headers['x-user-role'] as 'provider' | 'seeker';

  if (!userId) {
    throw new AppError(401, 'Missing X-User-Id header', 'UNAUTHORIZED');
  }

  (request as AuthenticatedRequest).userId = userId;
  (request as AuthenticatedRequest).userRole = userRole || 'seeker';
}

// Optional auth - doesn't fail if not present
export async function optionalAuthMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const userId = request.headers['x-user-id'] as string;
  const userRole = request.headers['x-user-role'] as 'provider' | 'seeker';

  if (userId) {
    (request as AuthenticatedRequest).userId = userId;
    (request as AuthenticatedRequest).userRole = userRole || 'seeker';
  }
}
