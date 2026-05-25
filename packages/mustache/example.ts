import { Stache } from "./mod.ts";

const engine = new Stache("/tmp");

// Interpolation
const html = await engine.render("<h1>Hello {{=name}}!</h1>", { name: "World" });
console.log("render:", html);

// Conditional
const tmpl = "{{?show}}<p>visible</p>{{?}}{{?!show}}<p>hidden</p>{{?}}";
console.log("conditional (true):", await engine.render(tmpl, { show: true }));
console.log("conditional (false):", await engine.render(tmpl, { show: false }));

// Iteration
const list = "<ul>{{~items:item}}<li>{{=item}}</li>{{~}}</ul>";
console.log("list:", await engine.render(list, { items: ["a", "b", "c"] }));
