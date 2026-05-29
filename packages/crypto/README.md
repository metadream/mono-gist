# @gist/crypto

Cryptographic utilities built on Web Crypto API: SHA-256, AES-CBC, RSA-OAEP, JWT-style encryption, and PBKDF2 password hashing. Zero external dependencies.

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

// JWT-style encryption
const token = await JWT.create({ sub: "user123", exp: Date.now() + 3600000 }, publicKey);
const payload = await JWT.verify(token, privateKey);
```

## API

### `sha256(message: string): Promise<string>`
Computes the SHA-256 digest as a lowercase hex string.

### `AES.encrypt(plaintext: string, key: string): Promise<string>`
Encrypts `plaintext` with `key` using AES-CBC. Returns `base64(iv).base64(ciphertext)`.

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

### `JWT.create(payload: Record<string, unknown>, publicKey: CryptoKey): Promise<string>`
Encrypts a JSON payload with an RSA public key.

### `JWT.verify(jwt: string, privateKey: CryptoKey): Promise<Record<string, unknown> | undefined>`
Decrypts a token and verifies the `exp` timestamp. Returns the payload or `undefined`.

### `Password.hash(password: string, options?): Promise<string>`
Hashes a password with PBKDF2-SHA256 (100k iterations, 16-byte salt, 32-byte key by default). Returns a PHC string: `$pbkdf2$iterations$salt$hash`.

Options: `{ iterations?: number, saltLength?: number, keyLength?: number }`

### `Password.verify(password: string, hash: string): Promise<boolean>`
Verifies a password against a PHC string produced by `Password.hash`.
