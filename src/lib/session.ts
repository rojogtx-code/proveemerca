import crypto from "crypto";

const ALGORITHM = "sha256";
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24; // 24 horas, igual al maxAge de la cookie

export interface AdminSessionPayload {
  sub: string;
  email: string;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET no está configurado en las variables de entorno");
  }
  return secret;
}

/**
 * Firma un token de sesión HMAC-SHA256 con expiración embebida.
 * Formato: base64url(payload).base64url(firma)
 */
export function createSessionToken(
  payload: Omit<AdminSessionPayload, "exp">,
  ttlMs: number = DEFAULT_TTL_MS
): string {
  const fullPayload: AdminSessionPayload = { ...payload, exp: Date.now() + ttlMs };
  const body = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto.createHmac(ALGORITHM, getSecret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

/**
 * Verifica la firma y expiración de un token de sesión.
 * Devuelve el payload si es válido, o null si es inválido/expirado/ausente.
 */
export function verifySessionToken(token: string | undefined | null): AdminSessionPayload | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  if (!body || !signature) return null;

  const expectedSignature = crypto.createHmac(ALGORITHM, getSecret()).update(body).digest("base64url");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as AdminSessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
