# @gist/crypto

Cryptographic utilities built on Web Crypto API: SHA-256, AES-256-GCM, RSA-OAEP, JWT HS256, and PBKDF2 password hashing. Zero external dependencies.

**Supported runtimes:** ✅ Node.js · ✅ Deno · ✅ Bun · ✅ Cloudflare Workers · ✅ Browsers

## Install

```bash
bunx jsr add @gist/crypto
```

## Usage

```ts
import { sha256, Password, AES, RSA, JWT } from "@gist/crypto";

// SHA-256
const hash = await sha256("hello");

// Password hashing
const pwHash = await Password.hash("s3cret");
const ok = await Password.verify("s3cret", pwHash); // true

// AES encrypt/decrypt
const encrypted = await AES.encrypt("secret data", "password");
const decrypted = await AES.decrypt(encrypted, "password");

// RSA key pair
const { publicKey, privateKey } = await RSA.generateKeyPair();
const pem = await RSA.exportPublicKey(publicKey);

// JWT HS256
const token = await JWT.sign({ sub: "user123" }, "secret", { expiresIn: 3600 });
const payload = await JWT.verify(token, "secret");
```

## API

### `sha256(message: string): Promise<string>`
Computes the SHA-256 digest as a lowercase hex string.

### `AES.encrypt(plaintext: string, key: string): Promise<string>`
Encrypts `plaintext` with `key` using AES-256-GCM. Returns `base64(salt).base64(iv).base64(ciphertext)`.

### `AES.decrypt(ciphertext: string, key: string): Promise<string | undefined>`
Decrypts ciphertext produced by `AES.encrypt`. Returns the plaintext or `undefined` on failure.

### `RSA.generateKeyPair(): Promise<CryptoKeyPair>`
Generates an RSA-OAEP 2048-bit key pair.

### `RSA.exportPublicKey(key: CryptoKey): Promise<string>`
Exports a public key as a PEM string.

### `RSA.exportPrivateKey(key: CryptoKey): Promise<string>`
Exports a private key as a PEM string.

### `RSA.importPublicKey(pem: string): Promise<CryptoKey>`
Imports a PEM public key.

### `RSA.importPrivateKey(pem: string): Promise<CryptoKey>`
Imports a PEM private key.

### `RSA.encrypt(plaintext: string, publicKey: CryptoKey): Promise<string>`
Encrypts plaintext with a public key. Returns base64 ciphertext.

### `RSA.decrypt(ciphertext: string, privateKey: CryptoKey): Promise<string>`
Decrypts base64 ciphertext with a private key.

### `JWT.sign(payload: Record<string, unknown>, secret: string, options?): Promise<string>`
Creates a signed JWT string (HS256). Automatically adds `iat` (issued at) claim. If `options.expiresIn` (seconds) is provided, also adds `exp` claim.

### `JWT.verify(jwt: string, secret: string): Promise<Record<string, unknown> | undefined>`
Verifies a JWT signature and checks `exp`. Returns the payload or `undefined`.

### `Password.hash(password: string, options?): Promise<string>`
Hashes a password with PBKDF2-SHA256 (100k iterations, 16-byte salt, 32-byte key by default). Returns a PHC string: `$pbkdf2$iterations$salt$hash`.

Options: `{ iterations?: number, saltLength?: number, keyLength?: number }`

### `Password.verify(password: string, hash: string): Promise<boolean>`
Verifies a password against a PHC string produced by `Password.hash`.
