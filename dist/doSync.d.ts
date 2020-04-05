declare type JSONPrimitive = string | number | boolean | null;
declare type JSONValue = JSONPrimitive | JSONObject | JSONArray;
declare type JSONObject = {
    [member: string]: JSONValue;
};
declare type JSONArray = JSONValue[];
export declare type Value = JSONValue;
export declare type AsyncFn<I extends Value[] = Value[], O extends Value = Value> = (...v: I) => Promise<O>;
export declare const doSync: <I extends Value[], O extends Value>(f: AsyncFn<I, O>) => (...ip: I) => O;
export default doSync;
//# sourceMappingURL=doSync.d.ts.map