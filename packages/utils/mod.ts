import { normalize } from "path";

export function nanoid(size = 24, alphabet?: string): string {
    const chars = alphabet ?? "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const bytes = crypto.getRandomValues(new Uint8Array(size));

    let id = alphabet ? chars[bytes[0] % chars.length] : chars[bytes[0] % 52];
    for (let i = 1; i < size; i++) {
        id += chars[bytes[i] % chars.length];
    }
    return id;
}

export function normalizePath(path: string): string {
    return normalize(path)
        .replace(/\\/g, "/")
        .replace(/\/+/g, "/")
        .replace(/^\//, "");
}

export function isValidPath(path: string): boolean {
    if (!path || path.trim() === "" || path.length > 255) return false;

    const illegalChars = /[<>:"|?*\x00-\x1F]/;
    const parts = path.split(/[\\/]/).filter(Boolean);

    for (const part of parts) {
        if (illegalChars.test(part)) return false;

        const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i;
        if (reservedNames.test(part)) return false;

        if (part.endsWith(" ") || part.endsWith(".")) return false;
    }
    return true;
}

export function randomInt(a: number, b: number): number {
    b = b > a ? b : a;
    return Math.floor(Math.random() * (b - a) + a);
}

export function randomSample(origin: number, bound: number, size: number): number[] {
    const maxAvailable = Math.max(0, bound - origin);
    const actualSize = Math.min(size, maxAvailable);
    const res = new Set<number>();
    while (res.size < actualSize) res.add(Math.floor(Math.random() * maxAvailable + origin));
    return [...res];
}

export function shuffle(array: Array<unknown>): unknown[] {
    return array.sort(() => Math.random() - 0.5);
}

export function firstUpperCase(text: string): string {
    return text.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}

export function stripHtml(html: string, ignoredTags: Array<string> = []): string {
    ignoredTags.push(" ");
    const tags = ignoredTags.join("|");
    return html.replace(new RegExp("<(?!\/?(" + tags + ")\\b)[^<>]+>", "gm"), "").replace(/([\r\n]+ +)+/gm, "");
}

export function truncate(text: string, length: number): string {
    const cnRegex = /[^\\x00-\\xff]/g;

    if (text.replace(cnRegex, "**").length > length) {
        const m = Math.floor(length / 2);
        for (let i = m, l = text.length; i < l; i++) {
            const _text = text.substring(0, i);
            if (_text.replace(cnRegex, "**").length >= length) {
                return _text + "...";
            }
        }
    }
    return text;
}

export function isPlainObject(value: unknown): boolean {
    if (!value || typeof value !== "object" || Object.prototype.toString.call(value) != "[object Object]") {
        return false;
    }
    if (Object.getPrototypeOf(value) === null) {
        return true;
    }
    let proto = value;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(value) === proto;
}

export function formatString(pattern: string, args: Array<string> | Record<string, string>): string {
    if (Array.isArray(args)) {
        for (let i = 0; i < args.length; i++) {
            pattern = pattern.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
        }
    } else {
        for (const i in args) {
            pattern = pattern.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
        }
    }
    return pattern;
}

export function formatBytes(bytes: number): string {
    if (!bytes || bytes < 1) return "0";
    const unit = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB"];
    const base = Math.min(unit.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const scale = Math.max(0, base - 2);
    return parseFloat((bytes / Math.pow(1024, base)).toFixed(scale)) + " " + unit[base];
}

export function formatDate(date: Date | string | number, pattern: string): string {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) throw new Error("Invalid date");

    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours24 = d.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
    const milliseconds = d.getMilliseconds();
    const ampm = hours24 < 12 ? "AM" : "PM";

    return pattern
        .replace(/yyyy/g, String(year))
        .replace(/yy/g, String(year).slice(-2))
        .replace(/MM/g, String(month).padStart(2, "0"))
        .replace(/M/g, String(month))
        .replace(/dd/g, String(day).padStart(2, "0"))
        .replace(/d/g, String(day))
        .replace(/HH/g, String(hours24).padStart(2, "0"))
        .replace(/H/g, String(hours24))
        .replace(/hh/g, String(hours12).padStart(2, "0"))
        .replace(/h/g, String(hours12))
        .replace(/mm/g, String(minutes).padStart(2, "0"))
        .replace(/m/g, String(minutes))
        .replace(/ss/g, String(seconds).padStart(2, "0"))
        .replace(/s/g, String(seconds))
        .replace(/SSS/g, String(milliseconds).padStart(3, "0"))
        .replace(/S/g, String(milliseconds))
        .replace(/a/g, ampm);
}

export function formatSeconds(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return (
        (d > 0 ? d + "d " : "") +
        (h > 0 ? h + "h " : "") +
        (m > 0 ? m + "m " : "") +
        (s > 0 ? s + "s" : "")
    ).trim();
}

export function formatDuration(n: number, options?: { leading?: boolean; ms?: boolean }): string {
    const ms = Math.trunc(n) % 1000;
    const seconds = Math.trunc(n / 1000) % 60;
    const minutes = Math.trunc(n / 60000) % 60;
    const hours = Math.trunc(n / 3600000);
    options = options || { leading: false, ms: false };

    let result = "";
    if (hours > 0) {
        result = (options.leading ? hours.toString().padStart(2, "0") : hours) + ":";
        options.leading = true;
    }
    result +=
        (options.leading ? minutes.toString().padStart(2, "0") : minutes) + ":" + seconds.toString().padStart(2, "0");
    if (options.ms) {
        result += "." + ms.toString().padStart(3, "0");
    }
    return result;
}

export function parseDuration(s: string): number {
    if (!s) return 0;
    const m = s.trim().match(/^(\d{2}):(\d{2}):(\d{2})(\.\d{1,3})?$/);
    if (!m) return 0;

    const hours = parseInt(m[1], 10);
    const minutes = parseInt(m[2], 10);
    const seconds = parseInt(m[3], 10);
    const ms = parseFloat(m[4]) || 0;

    if (hours > 59 || minutes > 59 || seconds > 59) return 0;
    return (hours * 60 + minutes) * 60 + seconds + ms;
}

export function localeCompare(aStr: string, bStr: string, locale = "zh"): number {
    const regExp = [/[\s\~\!\@\#\$\%\^\&\*\(\)\-\_\+\=\{\}\[\]\|\<\>\,\.\?\/\\]/, /[0-9]/, /[a-zA-Z]/, /./];

    const length = Math.min(aStr.length, bStr.length);
    for (let i = 0; i < length; i++) {
        const aChar = aStr.charAt(i);
        const bChar = bStr.charAt(i);
        if (aChar === bChar) continue;

        const aIndex = regExp.findIndex((v) => v.test(aChar));
        const bIndex = regExp.findIndex((v) => v.test(bChar));

        if (aIndex != bIndex) {
            return aIndex - bIndex;
        }
        if (aIndex === 1) {
            return parseInt(aChar) - parseInt(bChar);
        }
        if (aIndex === 2) {
            return aChar.toLowerCase() < bChar.toLowerCase() ? -1 : 1;
        }
        if (aIndex === 3) {
            return aChar.localeCompare(bChar, locale);
        }
        return aChar < bChar ? -1 : 1;
    }
    return aStr.length - bStr.length;
}

export function mergeObjects(...objs: Array<any>): unknown {
    const result: any = {};
    objs.forEach((obj) => {
        for (const key in obj) {
            const value = obj[key];
            if (isPlainObject(result[key]) && isPlainObject(value)) {
                result[key] = mergeObjects(result[key], value);
            } else {
                result[key] = value;
            }
        }
    });
    return result;
}

export function mergeArrays(arr1: any[], arr2: any[], callback: Function): unknown[] {
    const merged: Array<any> = [];
    const clone = [...arr2];
    arr1.forEach((a1) => {
        const index = clone.findIndex((a2) => callback(a1, a2));
        if (index > -1) {
            const found = clone.splice(index, 1)[0];
            merged.push(Object.assign(a1, found));
        }
    });
    return merged;
}

export function swapArray(arr: unknown[], index1: number, index2: number): unknown[] {
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    return arr;
}
