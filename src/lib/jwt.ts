// Usar Web Crypto API que está disponible en Edge Runtime
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-seguro';

export interface ClienteToken {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

// Función para convertir string a ArrayBuffer
function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// Función para convertir ArrayBuffer a string
function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

// Función para convertir ArrayBuffer a Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Función para convertir Base64 a ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function generateToken(payload: Omit<ClienteToken, 'iat' | 'exp'>): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const exp = now + (7 * 24 * 60 * 60); // 7 días

  const data = {
    ...payload,
    iat: now,
    exp
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(data));

  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    stringToArrayBuffer(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    stringToArrayBuffer(signatureInput)
  );

  const encodedSignature = arrayBufferToBase64(signature)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

export async function verifyToken(token: string): Promise<ClienteToken | null> {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');

    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      stringToArrayBuffer(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = base64ToArrayBuffer(
      encodedSignature.replace(/-/g, '+').replace(/_/g, '/')
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      stringToArrayBuffer(signatureInput)
    );

    if (!isValid) {
      return null;
    }

    const payload = JSON.parse(atob(encodedPayload)) as ClienteToken;
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
} 