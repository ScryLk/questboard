// ── API Response Helpers ──

export function createErrorResponse(code: string, message: string) {
  return {
    success: false as const,
    error: { code, message },
  };
}

export function createSuccessResponse<T>(data: T) {
  return {
    success: true as const,
    data,
  };
}
