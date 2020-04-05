declare type JSONPrimitive = string | number | boolean | null;
export declare type AsyncFn<I extends JSONPrimitive[] = JSONPrimitive[], O extends JSONPrimitive = JSONPrimitive> = (...v: I) => Promise<O>;
export declare const doSync: <I extends JSONPrimitive[], O extends JSONPrimitive>(f: AsyncFn<I, O>) => (...ip: I) => O;
export default doSync;
//# sourceMappingURL=doSync.d.ts.map