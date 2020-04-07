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

Limitations
-----------
- The function will be completely extracted from its scope context. It is run as though it was on its own, in its own file.
- Only JSON serializible parameters and response values are allowed.
- Typescript will enforce JSON serializibility, but as a result
pure `Object`s passed into functions, or returned by functions must extend
or implement JSONObject.

[1]: https://github.com/kentcdodds/babel-plugin-macros/issues/62#issuecomment-387155622