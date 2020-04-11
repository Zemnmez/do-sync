import crossSpawn from 'cross-spawn';
import { SpawnSyncOptions } from 'child_process';

export type JSONPrimitive = string | number | boolean | null | undefined;
export type JSONValue = JSONObject | JSONArray | JSONPrimitive;
export interface JSONObject extends Record<string, JSONValue> { }
export type JSONArray = JSONValue[];


/**
 * Value represents data that can safely be input to,
 * or returned from a doSync() function.
 */
export type Value = JSONValue

/**
 * An AsyncFn can be used with doSync().
 */
export type AsyncFn<I extends Value[], O extends Value> =
    (...v: I) => Promise<O>


const gen:
    (input: Value[], fn: AsyncFn<any, any>) => string
=
    (input, fn) => `
const main = async () => {
    console.log(JSON.stringify(await (${fn})(...${JSON.stringify(input)})));
}

main().catch(e => console.error(e));
`
;

export interface DoSyncOptions extends SpawnSyncOptions { }
/**
 * doSync returns a synchronous version of certian
 * special asynchronous functions by extracting them
 * and running them as a synchronous node subprocess.
 * 
 * The input and output types of the function must be serializible
 * to JSON, and the function must not reference any parent
 * scopes (i.e. file-defined variables) to function.
 */
export const doSync:
    <I extends Value[], O extends Value>(f: AsyncFn<I,O>, opts?: DoSyncOptions) =>
        (...ip: I) => O
=
    (fn, { maxBuffer = 1000 * 1024 * 1024, ...etc}: DoSyncOptions = {}) => (...ip) => {
        const proc = crossSpawn.sync('node', ['-'], {
            input: gen(ip, fn),
            maxBuffer,
            ...etc
        });

        const stderr = proc.stderr.toString('utf-8').trim();
        if (stderr) console.error(stderr);
        if (proc.error) throw proc.error;
        
        return JSON.parse(proc.stdout.toString('utf-8'));
    }
;

export default doSync;