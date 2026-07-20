// 客戶端加密:PBKDF2(SHA-256) 派生金鑰 + AES-GCM。Drive 上只存這裡輸出的密文。

const ITERATIONS = 310_000

const b64 = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf instanceof Uint8Array ? buf : new Uint8Array(buf))))

const unb64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0))

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export interface EncryptedPayload {
  v: 1
  alg: 'AES-GCM'
  kdf: 'PBKDF2-SHA256'
  iterations: number
  salt: string
  iv: string
  ct: string
}

export async function encryptString(plain: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, new TextEncoder().encode(plain))
  const payload: EncryptedPayload = {
    v: 1, alg: 'AES-GCM', kdf: 'PBKDF2-SHA256', iterations: ITERATIONS,
    salt: b64(salt), iv: b64(iv), ct: b64(ct),
  }
  return JSON.stringify(payload)
}

export async function decryptString(payloadText: string, password: string): Promise<string> {
  let payload: EncryptedPayload
  try {
    payload = JSON.parse(payloadText)
  } catch {
    throw new Error('備份檔格式不正確')
  }
  if (payload.alg !== 'AES-GCM') throw new Error('不支援的加密格式')
  const key = await deriveKey(password, unb64(payload.salt))
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: unb64(payload.iv) as BufferSource },
      key,
      unb64(payload.ct) as BufferSource,
    )
    return new TextDecoder().decode(plain)
  } catch {
    throw new Error('解密失敗:密碼錯誤或檔案損毀')
  }
}
