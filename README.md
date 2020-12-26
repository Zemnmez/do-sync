do-sync
========

`do-sync` is a small library that allows certian kinds of async functions to be executed synchronously in node.

Why Though? Isn't this a terrible idea?
---------------------------------------

`babel-plugin-macros` does not support asynchrony in macros<sup>[1]</sup>, but many vital libraries like `sharp` require asynchrony to function -- and, in fact do not support synchronous usage.

Example
-------

```typescript
import { doSync, AsyncFn, JSONObject } from 'do-sync';

interface resizeOpts extends JSONObject {
    width: number, height: number
}

interface resizeRet extends JSONObject {
    width: number, height: number, blob: string,
}

const resize = doSync(async (target: string, { width, height, ...jpegOpions }: resizeOpts): Promise<resizeRet> => {
    const sharp = require('sharp');
    const blob = 
        (await sharp(Buffer.from(target, 'base64'))
            .resize(width, height)
            .jpeg(jpegOpions)
            .toBuffer()).toString('base64');
    return { blob, width, height };
})

const myImage = resize('cool.png', {
    width: 10, height: 10
})
```

This package is used to implement [image.macro], which dynamically resizes high-resolution images to multiple sizes at compilation time for use with webpack. It's a little rough around the edges, but works well and should provide some more concrete usage examples:

- [do-sync function definition](https://github.com/Zemnmez/image.macro/blob/master/src/resize.ts#L41)
- [usage in macro](https://github.com/Zemnmez/image.macro/blob/ab403a25ca517da8cb749d11c9248479beaebd71/src/image.macro.ts#L84)

Limitations
-----------
- The function will be completely extracted from its scope context. It is run as though it was on its own, in its own file.
- Only JSON serializible parameters and response values are allowed.
- Typescript will enforce JSON serializibility, but as a result
pure `Object`s passed into functions, or returned by functions must extend
or implement JSONObject.
- If the process throws an error, properties that cannot be serialized to JSON will not cross the process boundary.

[1]: https://github.com/kentcdodds/babel-plugin-macros/issues/62#issuecomment-387155622


Footguns
--------
### ENOBUFS
`do-sync` uses a node subprocess and writes all code to STDIN. `child_process.spawnSync` has a default limit on STDIN input which can, if large JSON is transiting STDIN make your program explode. `doSync` takes an optional second parameter, `opts`, which has the same options as `spawnSync` -- the value is already very large (1GB), but you can set maxBuffer to something bigger if you encounter issues:

```typescript
doSync(myFunc, {
    maxBuffer: 1024 * 1024 * 1024
})
```

[image.macro]: https://github.com/Zemnmez/image.macro/blob/ab403a25ca517da8cb749d11c9248479beaebd71/src/resize.ts
[issue]: https://github.com/Zemnmez/do-sync/issues
