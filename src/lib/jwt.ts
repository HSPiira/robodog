import { SignJWT, jwtVerify, JWTPayload } from 'jose';

// Secret key for signing JWT tokens
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-replace-in-production'
);

// Token expiration time
const TOKEN_EXPIRATION = '7d'; // string format for readability

export interface JwtPayload extends JWTPayload {
  userId: string;
  email: string;
  role?: string;
  isActive: boolean;
}

/**
 * Generate a JWT token for a user
 */
export async function generateToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .setIssuer('your-app-name')
    .setAudience('your-app-client')
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT token and return the decoded payload
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'your-app-name',
      audience: 'your-app-client',
    });
    return payload as JwtPayload;
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    return null;
  }
}

/**
 * Extract token from request headers or cookies
 */
export function getTokenFromRequest(request: Request): string | null {
  try {
    // First check Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    // Then check cookies
    const cookies = request.headers.get('cookie');
    if (!cookies) return null;

    const parsedCookies = Object.fromEntries(
      cookies.split(';').map(c => c.trim().split('=').map(decodeURIComponent))
    );

    return parsedCookies['auth-token'] || null;
  } catch (error) {
    console.error('Error extracting token from request:', error);
    return null;
  }
}
