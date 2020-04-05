do-sync
========

`do-sync` is a small library that allows certian kinds of async functions to be executed synchronously in node.

Why Though? Isn't this a terrible idea?
---------------------------------------

`babel-plugin-macros` does not support asynchrony in macros<sup>[1]</sup>, but many vital libraries like `sharp` require asynchrony to function -- and, in fact do not support synchronous usage.

Example
-------

```typescript
import { doSync, AsyncFn } from 'do-sync';

const resize: AsyncFn = (target: string, width: number, height: number) => {
    const sharp = require('sharp');
    return sharp(target)
        .resize(width, height)
        .toBuffer()
        .toString('base64')
}

const myImage = doSync(resize)('cool.png', {
    width: 10, height: 10
})
```

Limitations
-----------
- The function will be completely extracted from its scope context. It is run as though it was on its own, in its own file.
- Only JSON serializible parameters and response values are allowed.

[1]: https://github.com/kentcdodds/babel-plugin-macros/issues/62#issuecomment-387155622