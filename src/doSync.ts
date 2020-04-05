import crossSpawn from 'cross-spawn';

export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONObject | JSONArray | JSONPrimitive;
export interface JSONObject extends Record<string, JSONValue> { }
export type JSONArray = JSONValue[];


export type Value = JSONValue

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

export const doSync:
    <IK extends Value, I extends IK[], O extends Value>(f: AsyncFn<I,O>) =>
        (...ip: I) => O
=
    fn => (...ip) => {
        const proc = crossSpawn.sync('node', ['-'], {
            input: gen(ip, fn)
        });

        if (proc.error) throw Error;
        const stderr = proc.stderr.toString('utf-8').trim();
        if (stderr) console.error(stderr);
        
        return JSON.parse(proc.stdout.toString('utf-8'));
    }
;

export default doSync;