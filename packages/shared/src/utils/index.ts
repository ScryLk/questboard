/**
 * Generate a random invite code for sessions.
 */
export function generateInviteCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Create a standard API error response.
 */
export function createErrorResponse(code: string, message: string) {
  return {
    success: false as const,
    error: { code, message },
  };
}

/**
 * Create a standard API success response.
 */
export function createSuccessResponse<T>(data: T) {
  return {
    success: true as const,
    data,
  };
}
