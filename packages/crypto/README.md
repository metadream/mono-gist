# @gist/crypto

Cryptographic utilities built on Web Crypto API: SHA-1, AES-CBC, RSA-OAEP, and JWT-style encryption. Zero external dependencies.

## Install

```bash
bunx jsr add @gist/crypto
```

## Usage

```ts
import { sha1, AES, RSA, JWT } from "@gist/crypto";

// SHA-1
const hash = await sha1("hello");

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
