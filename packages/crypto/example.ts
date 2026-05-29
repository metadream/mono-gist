import { sha256, AES, RSA, JWT } from "./mod.ts";

// SHA-256
console.log("sha256:", await sha256("hello"));

// AES
const enc = await AES.encrypt("secret", "pass");
console.log("aes encrypted:", enc);
console.log("aes decrypted:", await AES.decrypt(enc, "pass"));

// RSA
const { publicKey, privateKey } = await RSA.generateKeyPair();
const pubPem = await RSA.exportPublicKey(publicKey);
console.log("rsa public key:", pubPem.slice(0, 50) + "...");

const cipher = await RSA.encrypt("rsa secret", publicKey);
console.log("rsa decrypted:", await RSA.decrypt(cipher, privateKey));

// JWT-style
const token = await JWT.create({ sub: "u1", exp: Date.now() + 3600000 }, publicKey);
console.log("jwt payload:", await JWT.verify(token, privateKey));
