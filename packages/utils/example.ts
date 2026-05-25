import { nanoid, formatDate, formatBytes, formatSeconds, localeCompare, mergeObjects } from "./mod.ts";

console.log("nanoid:", nanoid());

console.log("formatDate:", formatDate(new Date(), "yyyy-MM-dd HH:mm:ss"));
console.log("formatBytes:", formatBytes(1048576));
console.log("formatSeconds:", formatSeconds(3661));

console.log("localeCompare:", localeCompare("张三", "李四"));

console.log("merge:", mergeObjects({ a: 1, nested: { x: 1 } }, { b: 2, nested: { y: 2 } }));
