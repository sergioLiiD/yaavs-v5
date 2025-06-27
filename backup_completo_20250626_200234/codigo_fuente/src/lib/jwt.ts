// Usar Web Crypto API que está disponible en Edge Runtime
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-seguro';

export interface ClienteToken {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

// Función para convertir string a Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// Función para convertir Uint8Array a string
function uint8ArrayToString(buffer: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

// Función para convertir Uint8Array a Base64
function uint8ArrayToBase64(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

// Función para convertir Base64 a Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
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
    stringToUint8Array(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    stringToUint8Array(signatureInput)
  );

  const encodedSignature = uint8ArrayToBase64(new Uint8Array(signature))
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
      stringToUint8Array(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = base64ToUint8Array(
      encodedSignature.replace(/-/g, '+').replace(/_/g, '/')
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      stringToUint8Array(signatureInput)
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