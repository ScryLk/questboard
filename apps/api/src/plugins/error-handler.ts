import type { FastifyInstance, FastifyError } from "fastify";
import { AppError } from "../errors/app-error.js";

export async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    // Fastify validation error
    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.message,
        },
      });
    }

    // Unknown error
    app.log.error(error);
    return reply.status(500).send({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Erro interno do servidor",
      },
    });
  });
}
