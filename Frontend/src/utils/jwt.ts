export interface DecodedToken {
  nameid?: string;
  sub?: string;
  role?: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
  email?: string;
  unique_name?: string;
  exp?: number;
  [key: string]: unknown;
}

export function parseJwt(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT token:', e);
    return null;
  }
}

export function extractUserFromToken(token: string): {
  id: string;
  role: 'player' | 'scout';
  email: string;
} | null {
  const decoded = parseJwt(token);
  if (!decoded) return null;

  const id =
    decoded.nameid ||
    decoded.sub ||
    decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
    '';

  const rawRole =
    decoded.role ||
    decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
    '';

  const role: 'player' | 'scout' =
    String(rawRole).toLowerCase() === 'scout' ? 'scout' : 'player';

  const email = decoded.email || decoded.unique_name || '';

  return { id, role, email };
}
