export declare type JSONPrimitive = string | number | boolean | null;
export declare type JSONValue = JSONObject | JSONArray | JSONPrimitive;
export interface JSONObject extends Record<string, JSONValue> {
}
export declare type JSONArray = JSONValue[];
export declare type Value = JSONValue;
export declare type AsyncFn<I extends Value[], O extends Value> = (...v: I) => Promise<O>;
export declare const doSync: <IK extends Value, I extends IK[], O extends Value>(f: AsyncFn<I, O>) => (...ip: I) => O;
export default doSync;
//# sourceMappingURL=doSync.d.ts.map