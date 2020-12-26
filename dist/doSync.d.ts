/// <reference types="node" />
import { SpawnSyncOptions } from 'child_process';
export declare type JSONPrimitive = string | number | boolean | null | undefined;
export declare type JSONValue = JSONObject | JSONArray | JSONPrimitive;
export interface JSONObject extends Record<string, JSONValue> {
}
export declare type JSONArray = JSONValue[];
/**
 * Value represents data that can safely be input to,
 * or returned from a doSync() function.
 */
export declare type Value = JSONValue;
/**
 * An AsyncFn can be used with doSync().
 */
export declare type AsyncFn<I extends Value[], O extends Value> = (...v: I) => Promise<O>;
export interface DoSyncOptions extends SpawnSyncOptions {
}
/**
 * doSync returns a synchronous version of certian
 * special asynchronous functions by extracting them
 * and running them as a synchronous node subprocess.
 *
 * The input and output types of the function must be serializible
 * to JSON, and the function must not reference any parent
 * scopes (i.e. file-defined variables) to function.
 */
export declare const doSync: <I extends Value[], O extends Value>(f: AsyncFn<I, O>, opts?: DoSyncOptions) => (...ip: I) => O;
export default doSync;
//# sourceMappingURL=doSync.d.ts.map