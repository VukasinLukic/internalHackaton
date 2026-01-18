import { FastifyInstance } from 'fastify';
import { analyzeApartmentImage } from '../controllers/vision.controller';

export async function visionRoutes(fastify: FastifyInstance) {
  fastify.post('/analyze-apartment', analyzeApartmentImage);
}
