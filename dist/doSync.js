"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doSync = void 0;
const cross_spawn_1 = __importDefault(require("cross-spawn"));
const gen = (input, fn) => `
const main = async () => {
    console.log(JSON.stringify({ type: "success", value: await (${fn})(...${JSON.stringify(input)}) }));
}

main().catch(e => console.log(JSON.stringify({ type: "failure", value: e })));
`;
/**
 * doSync returns a synchronous version of certian
 * special asynchronous functions by extracting them
 * and running them as a synchronous node subprocess.
 *
 * The input and output types of the function must be serializible
 * to JSON, and the function must not reference any parent
 * scopes (i.e. file-defined variables) to function.
 */
exports.doSync = (fn, { maxBuffer = 1000 * 1024 * 1024, ...etc } = {}) => (...ip) => {
    const proc = cross_spawn_1.default.sync('node', ['-'], {
        input: gen(ip, fn),
        maxBuffer,
        ...etc
    });
    const stderr = proc.stderr.toString('utf-8').trim();
    if (stderr)
        console.error(stderr);
    if (proc.error)
        throw proc.error;
    const rsp = JSON.parse(proc.stdout.toString('utf-8'));
    if (rsp.type == "failure")
        throw rsp.value;
    return rsp.value;
};
exports.default = exports.doSync;
//# sourceMappingURL=doSync.js.map