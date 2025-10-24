// backend/src/errors/index.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    override message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message)
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, message)
  }
}

export class PermissionError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(403, message)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`)
  }
}

export class OptimisticLockError extends AppError {
  constructor(message: string = 'Resource was modified by another user') {
    super(409, message)
  }
}

export class DuplicateError extends AppError {
  constructor(message: string = 'Duplicate resource') {
    super(409, message)
  }
}
