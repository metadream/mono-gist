import { resolve } from "node:path";

const Syntax = {
    PARTIAL: /\{\{@\s*(\S+?)\s*\}\}/g,
    BLOCK_HOLDER: /\{\{>\s*(\S+?)\s*\}\}/g,
    BLOCK_DEFINE: /\{\{<\s*(\S+?)\s*\}\}([\s\S]*?)\{\{<\s*\}\}/g,
    EVALUATE: /\{\{([\s\S]+?(\}?)+)\}\}/g,
    INTERPOLATE: /\{\{=([\s\S]+?)\}\}/g,
    CONDITIONAL: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
    ITERATIVE: /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
};

const Variable = {
    REMOVE: /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g,
    SPLIT: /[^\w$]+/g,
    KEYWORDS:
        /\b(abstract|arguments|async|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|of|package|private|protected|public|return|short|static|super|switch|synchronized|then|this|throw|throws|transient|true|try|typeof|undefined|var|void|volatile|while|with|yield|parseInt|parseFloat|decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|isFinite|isNaN|Array|ArrayBuffer|Object|Function|Math|Date|Boolean|String|RegExp|Map|Set|JSON|Promise|Reflect|Number|BigInt|Infinity|Error|NaN)\b/g,
    NUMBER: /^\d[^,]*|,\d[^,]*/g,
    BOUNDARY: /^,+|,+$/g,
    SPLIT2: /^$|,+/,
};

type Renderer = (data: unknown) => Promise<string>;

function readTextFile(path: string) {
    return Bun.file(path).text();
}

export class Mustache {
    private tmplRoot = "";
    private globalVars: Record<string, unknown> = {};
    private cache: Record<string, Renderer> = {};

    constructor(tmplRoot: string, globalVars: Record<string, unknown> = {}) {
        this.tmplRoot = tmplRoot;
        Object.assign(this.globalVars, globalVars);
    }

    compile(tmpl: string): Renderer {
        const codes: string[] = [];
        tmpl = this.block(tmpl);
        tmpl = this.escape(this.reduce(tmpl))
            .replace(Syntax.INTERPOLATE, (_: string, code: string) => {
                code = this.unescape(code);
                codes.push(code);
                return "'+(" + code + ")+'";
            })
            .replace(Syntax.CONDITIONAL, (_: string, elseCase: string, code: string) => {
                if (!code) return this.output(elseCase ? "}else{" : "}");
                code = this.unescape(code);
                codes.push(code);
                return this.output(elseCase ? "}else if(" + code + "){" : "if(" + code + "){");
            })
            .replace(Syntax.ITERATIVE, (_: string, arrName: string, valName: string, idxName: string) => {
                if (!arrName) return this.output("}}");
                codes.push(arrName);
                const defI = idxName ? "let " + idxName + "=-1;" : "";
                const incI = idxName ? idxName + "++;" : "";
                return this.output(`if(${arrName}){${defI}for (let ${valName} of ${arrName}){${incI}`);
            })
            .replace(Syntax.EVALUATE, (_: string, code: string) => {
                code = this.unescape(code);
                codes.push(code);
                return this.output(code + ";");
            });

        let source = "let out='" + tmpl + "';return out;";
        source = this.declare(codes) + source;

        try {
            const fn = new Function("data", source);
            return async (data: unknown) => {
                data = Object.assign({ ...this.globalVars }, data);
                return fn.call(null, data);
            };
        } catch (e) {
            console.error("function anonymous(data) {" + source + "}");
            throw e;
        }
    }

    render(tmpl: string, data: unknown): Promise<string> {
        return this.compile(tmpl)(data);
    }

    async view(file: string, data: unknown): Promise<string> {
        let render = this.cache[file];
        if (!render) {
            render = this.cache[file] = this.compile(await this.include(file));
        }
        return render(data);
    }

    private async include(file: string): Promise<string> {
        let tmpl = await readTextFile(resolve(this.tmplRoot, file));

        while (Syntax.PARTIAL.test(tmpl)) {
            tmpl = await this.replaceAsync(tmpl, Syntax.PARTIAL, async (_: string, _file: string) => {
                return await readTextFile(resolve(this.tmplRoot, _file));
            });
        }
        return tmpl;
    }

    private block(tmpl: string): string {
        const blocks: Record<string, string> = {};
        return tmpl
            .replace(Syntax.BLOCK_DEFINE, (_, name: string, block) => {
                blocks[name] = block;
                return "";
            })
            .replace(Syntax.BLOCK_HOLDER, (_, name: string) => blocks[name] || "");
    }

    private declare(codes: string[]): string {
        const varNames = codes
            .join(",")
            .replace(Variable.REMOVE, "")
            .replace(Variable.SPLIT, ",")
            .replace(Variable.KEYWORDS, "")
            .replace(Variable.NUMBER, "")
            .replace(Variable.BOUNDARY, "")
            .split(Variable.SPLIT2);

        const unique: Record<string, boolean> = {};
        const prefixVars = [];
        for (const name of varNames) {
            if (!unique[name]) {
                unique[name] = true;
                prefixVars.push(name);
            }
        }
        if (prefixVars.length) {
            const varString = prefixVars.map((v) => v + "=data." + v).join(",");
            return "let " + varString + ";";
        }
        return "";
    }

    private reduce(tmpl: string): string {
        return tmpl
            .trim()
            .replace(/<!--[\s\S]*?-->/g, "")
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/\n\s*\/\/.*/g, "")
            .replace(/(\r|\n)[\t ]+/g, "")
            .replace(/[\t ]+(\r|\n)/g, "")
            .replace(/\r|\n|\t/g, "");
    }

    private escape(tmpl: string): string {
        return tmpl.replace(/\\/g, "\\\\").replace(/\'/g, "\\'");
    }

    private unescape(tmpl: string): string {
        return tmpl.replace(/\\'/g, "'");
    }

    private output(code: string): string {
        return "';" + code + "out+='";
    }

    private async replaceAsync(str: string, regex: RegExp, asyncFn: any) {
        const promises: any = [];
        const replacer: any = (match: any, ...args: any) => {
            const promise = asyncFn(match, ...args);
            promises.push(promise);
        };
        str.replace(regex, replacer);
        const data = await Promise.all(promises);
        return str.replace(regex, () => data.shift());
    }
}
