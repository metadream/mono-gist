interface AES {
    encrypt(plaintext: string, key: string): Promise<string>;
    decrypt(ciphertext: string, key: string): Promise<string | undefined>;
}

interface RSA {
    generateKeyPair(): Promise<CryptoKeyPair>;
    exportPublicKey(key: CryptoKey): Promise<string>;
    exportPrivateKey(key: CryptoKey): Promise<string>;
    importPublicKey(pem: string): Promise<CryptoKey>;
    importPrivateKey(pem: string): Promise<CryptoKey>;
    encrypt(plaintext: string, publicKey: CryptoKey): Promise<string>;
    decrypt(ciphertext: string, privateKey: CryptoKey): Promise<string>;
}

interface JWT {
    sign(payload: Record<string, unknown>, secret: string, options?: { expiresIn?: number }): Promise<string>;
    verify(jwt: string, secret: string): Promise<Record<string, unknown> | undefined>;
}

interface Password {
    hash(password: string, options?: { iterations?: number; saltLength?: number; keyLength?: number }): Promise<string>;
    verify(password: string, hash: string): Promise<boolean>;
}

function textEncode(s: string): Uint8Array<ArrayBuffer> {
    return new TextEncoder().encode(s) as Uint8Array<ArrayBuffer>;
}

function textDecode(u: Uint8Array) {
    return new TextDecoder().decode(u);
}

function encodeBase64(data: Uint8Array | ArrayBuffer): string {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

function decodeBase64(str: string): Uint8Array<ArrayBuffer> {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length) as Uint8Array<ArrayBuffer>;
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function base64urlEncode(data: Uint8Array | ArrayBuffer): string {
    return encodeBase64(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array<ArrayBuffer> {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    return decodeBase64(str);
}

async function importAesKey(key: string, salt: Uint8Array<ArrayBuffer>) {
    const baseKey = await crypto.subtle.importKey("raw", textEncode(key), "PBKDF2", false, ["deriveKey"]);
    return await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 10000, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"],
    );
}

/** Compute the SHA-256 digest of a string as a lowercase hex string. */
export async function sha256(message: string): Promise<string> {
    const buffer = await crypto.subtle.digest("SHA-256", textEncode(message));
    const array = Array.from(new Uint8Array(buffer));
    const hex = array.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hex;
}

/** AES-256-GCM encryption/decryption utilities. */
export const AES: AES = {
    /** Encrypt plaintext with a passphrase using AES-256-GCM. Returns `base64(salt).base64(iv).base64(ciphertext)`. */
    async encrypt(plaintext: string, key: string) {
        const salt = crypto.getRandomValues(new Uint8Array(16)) as Uint8Array<ArrayBuffer>;
        const iv = crypto.getRandomValues(new Uint8Array(12)) as Uint8Array<ArrayBuffer>;
        const encrypted = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            await importAesKey(key, salt),
            textEncode(plaintext),
        );
        return encodeBase64(salt) + "." + encodeBase64(iv) + "." + encodeBase64(encrypted);
    },

    /** Decrypt ciphertext produced by `AES.encrypt`. Returns the plaintext or `undefined` on failure. */
    async decrypt(ciphertext: string, key: string) {
        const parts = ciphertext.split(".");
        if (parts.length !== 3) return;
        try {
            const decrypted = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv: decodeBase64(parts[1]) },
                await importAesKey(key, decodeBase64(parts[0])),
                decodeBase64(parts[2]),
            );
            return textDecode(new Uint8Array(decrypted));
        } catch (e) {
            console.error(e);
        }
    },
};

/** RSA-OAEP encryption/decryption utilities. */
export const RSA: RSA = {
    /** Generate an RSA-OAEP 2048-bit key pair. */
    async generateKeyPair() {
        return await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"],
        );
    },

    /** Export a public key as a PEM string. */
    async exportPublicKey(key: CryptoKey) {
        const buffer = await crypto.subtle.exportKey("spki", key);
        const base64 = encodeBase64(new Uint8Array(buffer));
        return `-----BEGIN PUBLIC KEY-----\n${base64}\n-----END PUBLIC KEY-----`;
    },

    /** Export a private key as a PEM string. */
    async exportPrivateKey(key: CryptoKey) {
        const buffer = await crypto.subtle.exportKey("pkcs8", key);
        const base64 = encodeBase64(new Uint8Array(buffer));
        return `-----BEGIN PRIVATE KEY-----\n${base64}\n-----END PRIVATE KEY-----`;
    },

    /** Import a PEM-encoded public key. */
    async importPublicKey(pem: string) {
        const pemHeader = "-----BEGIN PUBLIC KEY-----\n";
        const pemFooter = "\n-----END PUBLIC KEY-----";
        const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
        return await crypto.subtle.importKey(
            "spki",
            decodeBase64(pemContents),
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["encrypt"],
        );
    },

    /** Import a PEM-encoded private key. */
    async importPrivateKey(pem: string) {
        const pemHeader = "-----BEGIN PRIVATE KEY-----\n";
        const pemFooter = "\n-----END PRIVATE KEY-----";
        const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
        return await crypto.subtle.importKey(
            "pkcs8",
            decodeBase64(pemContents),
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["decrypt"],
        );
    },

    /** Encrypt plaintext with a public key. Returns base64-encoded ciphertext. */
    async encrypt(plaintext: string, publicKey: CryptoKey) {
        return encodeBase64(await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, textEncode(plaintext)));
    },

    /** Decrypt base64-encoded ciphertext with a private key. */
    async decrypt(ciphertext: string, privateKey: CryptoKey) {
        return textDecode(
            new Uint8Array(await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, decodeBase64(ciphertext))),
        );
    },
};

/** JWT signing and verification using HS256 (HMAC-SHA256). */
export const JWT: JWT = {
    /** Sign a JSON payload into a JWT string using HS256. */
    async sign(payload: Record<string, unknown>, secret: string, options?: { expiresIn?: number }) {
        const header = { alg: "HS256", typ: "JWT" };
        const now = Math.floor(Date.now() / 1000);
        (payload as any).iat = now;
        if (options?.expiresIn) (payload as any).exp = now + options.expiresIn;
        const data = base64urlEncode(textEncode(JSON.stringify(header))) + "." +
            base64urlEncode(textEncode(JSON.stringify(payload)));
        const key = await crypto.subtle.importKey("raw", textEncode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        const signature = await crypto.subtle.sign("HMAC", key, textEncode(data));
        return data + "." + base64urlEncode(new Uint8Array(signature));
    },

    /** Verify a JWT string and return the payload, or `undefined` if invalid or expired. */
    async verify(jwt: string, secret: string) {
        const parts = jwt.split(".");
        if (parts.length !== 3) return;
        try {
            const [headerB64, payloadB64, sigB64] = parts;
            const data = headerB64 + "." + payloadB64;
            const key = await crypto.subtle.importKey("raw", textEncode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
            const ok = await crypto.subtle.verify("HMAC", key, base64urlDecode(sigB64), textEncode(data));
            if (!ok) return;
            const payload = JSON.parse(textDecode(base64urlDecode(payloadB64))) as Record<string, unknown>;
            if (payload.exp && Math.floor(Date.now() / 1000) > (payload.exp as number)) return;
            return payload;
        } catch {
            return;
        }
    },
};

/** PBKDF2-based password hashing and verification (PHC string format). */
export const Password: Password = {
    /** Hash a password with PBKDF2-SHA256. Returns a PHC string: `$pbkdf2$&lt;iterations&gt;$&lt;base64-salt&gt;$&lt;base64-hash&gt;` */
    async hash(
        password: string,
        options?: { iterations?: number; saltLength?: number; keyLength?: number },
    ): Promise<string> {
        const iterations = options?.iterations ?? 100000;
        const saltLength = options?.saltLength ?? 16;
        const keyLength = options?.keyLength ?? 32;
        const salt = crypto.getRandomValues(new Uint8Array(saltLength)) as Uint8Array<ArrayBuffer>;
        const key = await crypto.subtle.importKey("raw", textEncode(password), { name: "PBKDF2" }, false, [
            "deriveBits",
        ]);
        const derived = await crypto.subtle.deriveBits(
            { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
            key,
            keyLength * 8,
        );
        return `$pbkdf2$${iterations}$${encodeBase64(salt)}$${encodeBase64(new Uint8Array(derived))}`;
    },

    /** Verify a password against a PHC string produced by `Password.hash`. */
    async verify(password: string, hash: string): Promise<boolean> {
        const parts = hash.split("$");
        if (parts.length < 5 || parts[1] !== "pbkdf2") return false;
        const iterations = parseInt(parts[2], 10);
        const salt = decodeBase64(parts[3]);
        const expectedHash = parts[4];
        const hashLen = Math.floor((expectedHash.replace(/=+$/, "").length * 3) / 4);
        const key = await crypto.subtle.importKey("raw", textEncode(password), { name: "PBKDF2" }, false, [
            "deriveBits",
        ]);
        const derived = await crypto.subtle.deriveBits(
            { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
            key,
            hashLen * 8,
        );
        const actualHash = encodeBase64(new Uint8Array(derived));
        if (actualHash.length !== expectedHash.length) return false;
        let result = 0;
        for (let i = 0; i < actualHash.length; i++) {
            result |= actualHash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
        }
        return result === 0;
    },
};
