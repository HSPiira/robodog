import jwt from "jsonwebtoken";

// Secret key for signing JWT tokens
// In production, this should be stored in environment variables
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-replace-in-production";

// Token expiration time (in seconds)
const TOKEN_EXPIRATION = 60 * 60 * 24 * 7; // 7 days

export interface JwtPayload {
  userId: string;
  email: string;
  role?: string;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });
}

/**
 * Verify a JWT token and return the decoded payload
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error("Error verifying JWT token:", error);
    return null;
  }
}

/**
 * Extract token from request headers or cookies
 */
export function getTokenFromRequest(request: Request): string | null {
  try {
    // First check Authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    // Then check cookies
    const cookies = request.headers.get("cookie");
    if (!cookies) {
      return null;
    }

    const cookiePairs = cookies
      .split(";")
      .map((cookie) => cookie.trim().split("="));
    const authTokenCookie = cookiePairs.find(([key]) => key === "auth-token");

    if (!authTokenCookie || !authTokenCookie[1]) {
      return null;
    }

    return decodeURIComponent(authTokenCookie[1]);
  } catch (error) {
    console.error("Error extracting token from request:", error);
    return null;
  }
}
