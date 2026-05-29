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

const textEncode = (s: string): Uint8Array<ArrayBuffer> => new TextEncoder().encode(s) as Uint8Array<ArrayBuffer>;
const textDecode = (u: Uint8Array) => new TextDecoder().decode(u);

const importAesKey = async (key: string) => {
    const digest = await crypto.subtle.digest("SHA-1", textEncode(key));
    const rawKey = new Uint8Array(digest).slice(0, 16);
    return await crypto.subtle.importKey("raw", rawKey, "AES-CBC", true, ["encrypt", "decrypt"]);
};

/** Compute the SHA-256 digest of a string as a lowercase hex string. */
export async function sha256(message: string): Promise<string> {
    const buffer = await crypto.subtle.digest("SHA-256", textEncode(message));
    const array = Array.from(new Uint8Array(buffer));
    const hex = array.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hex;
}

/** AES-CBC encryption/decryption utilities. */
export const AES: any = {
    /** Encrypt plaintext with a passphrase using AES-CBC. Returns `base64(iv).base64(ciphertext)`. */
    async encrypt(plaintext: string, key: string) {
        const iv = crypto.getRandomValues(new Uint8Array(16)) as Uint8Array<ArrayBuffer>;
        const encrypted = await crypto.subtle.encrypt(
            { name: "AES-CBC", iv },
            await importAesKey(key),
            textEncode(plaintext),
        );
        return encodeBase64(iv) + "." + encodeBase64(encrypted);
    },

    /** Decrypt ciphertext produced by `AES.encrypt`. Returns the plaintext or `undefined` on failure. */
    async decrypt(ciphertext: string, key: string) {
        const index = ciphertext.indexOf(".");
        const iv = decodeBase64(ciphertext.substring(0, index));
        try {
            const decrypted = await crypto.subtle.decrypt(
                { name: "AES-CBC", iv },
                await importAesKey(key),
                decodeBase64(ciphertext.substring(index + 1)),
            );
            return textDecode(new Uint8Array(decrypted));
        } catch (e) {
            console.error(e);
        }
    },
};

/** RSA-OAEP encryption/decryption utilities. */
export const RSA: any = {
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

/** JWT-style encryption utilities (encrypts JSON payload with RSA public key). */
export const JWT: any = {
    /** Encrypt a JSON payload with an RSA public key. */
    async create(payload: Record<string, unknown>, publicKey: CryptoKey) {
        return await RSA.encrypt(JSON.stringify(payload), publicKey);
    },

    /** Decrypt and verify a JWT token. Checks `exp` timestamp and returns the payload, or `undefined` if expired. */
    async verify(jwt: string, privateKey: CryptoKey) {
        const payload: Record<string, unknown> = JSON.parse(await RSA.decrypt(jwt, privateKey));
        if (payload.exp && Date.now() > (payload.exp as number)) return;
        return payload;
    },
};

/** PBKDF2-based password hashing and verification (PHC string format). */
export const Password = {
    /** Hash a password with PBKDF2-SHA256. Returns a PHC string: `$pbkdf2$&lt;iterations&gt;$&lt;base64-salt&gt;$&lt;base64-hash&gt;` */
    async hash(password: string, options?: { iterations?: number; saltLength?: number; keyLength?: number }): Promise<string> {
        const iterations = options?.iterations ?? 100000;
        const saltLength = options?.saltLength ?? 16;
        const keyLength = options?.keyLength ?? 32;
        const salt = crypto.getRandomValues(new Uint8Array(saltLength)) as Uint8Array<ArrayBuffer>;
        const key = await crypto.subtle.importKey("raw", textEncode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
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
        const hashLen = Math.floor(expectedHash.replace(/=+$/, "").length * 3 / 4);
        const key = await crypto.subtle.importKey("raw", textEncode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
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
