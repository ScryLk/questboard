export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, "NOT_FOUND", `${resource} não encontrado`);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acesso negado") {
    super(403, "FORBIDDEN", message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autenticado") {
    super(401, "UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, "BAD_REQUEST", message);
    this.name = "BadRequestError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, "CONFLICT", message);
    this.name = "ConflictError";
  }
}
