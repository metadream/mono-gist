import { paginate } from "./mod.ts";

const p = paginate(500, 20, 5);
console.log("total pages:", p.totalPages);
console.log("compact pages:", p.compactPages);
console.log("current range:", p.begin, "-", p.end);
console.log("page size:", p.limit);

// Edge cases
console.log("all pages:", paginate(5, 10, 1).compactPages); // no ellipsis
console.log("near start:", paginate(100, 5, 2).compactPages); // trailing ellipsis
console.log("near end:", paginate(100, 5, 18).compactPages); // leading ellipsis
console.log("middle:", paginate(100, 5, 10).compactPages); // both ellipses
