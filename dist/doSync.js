"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_spawn_1 = __importDefault(require("cross-spawn"));
const gen = (input, fn) => `
const main = async () => {
    console.log(JSON.stringify(await (${fn})(...${JSON.stringify(input)})));
}

main().catch(e => console.error(e));
`;
exports.doSync = fn => (...ip) => {
    const proc = cross_spawn_1.default.sync('node', ['-'], {
        input: gen(ip, fn)
    });
    if (proc.error)
        throw Error;
    const stderr = proc.stderr.toString('utf-8').trim();
    if (stderr)
        console.error(stderr);
    return JSON.parse(proc.stdout.toString('utf-8'));
};
exports.default = exports.doSync;
//# sourceMappingURL=doSync.js.map