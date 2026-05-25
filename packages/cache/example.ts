import { ExpiringCache } from "./mod.ts";

const cache = new ExpiringCache<string, string>(10);

cache.set("greeting", "Hello, World!", 30);
console.log("get:", cache.get("greeting"));

cache.ttl("greeting", 60);
console.log("ttl updated");

cache.delete("greeting");
console.log("after delete:", cache.get("greeting"));

cache.set("a", "1", 10);
cache.set("b", "2", 10);
cache.clear();
console.log("after clear:", cache.get("a"), cache.get("b"));

cache.dispose();
