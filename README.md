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
- If the process crashes, it will not be obvious why without extra work (see: [Error Handling](#error-handeling))

[1]: https://github.com/kentcdodds/babel-plugin-macros/issues/62#issuecomment-387155622


Footguns
--------
### ENOBUFS
`do-sync` uses a node subprocess and writes all code to STDIN.
`child_process.spawnSync` has a default limit on STDIN input
which can, if large JSON is transiting STDIN make your program
explode. `doSync` takes an optional second parameter, `opts`,
which has the same options as `spawnSync` -- you can set maxBuffer
to something big enough to prevent issues:

```typescript
doSync(myFunc, {
    maxBuffer: 1024 * 1024 * 1024
})
```

### Error Handling
`do-sync`'s subprocess simply pipelines the input parameter JSON to the subprocess -- it does not
have a special way of knowing how the subprocess crashed, if it crashes. I am considering integrating
error catching and reporting functionality into do-sync, but for the moment do-sync will remain lean
on such features (if you have opinions on this, feel free to create an [issue]).

I recommend wrapping your function in `try{}catch{}` statements, and using them to coerce any subprocess error
into a JSON format that your consumer can expect. Here are some relevant snippets from [image.macro]:

<details>
<summary>

defining error and success types ([source](https://github.com/Zemnmez/image.macro/blob/ab403a25ca517da8cb749d11c9248479beaebd71/src/resize.ts#L10))

</summary>
    
```typescript
export interface JSONError extends Error, JSONObject {
    type: "error",
    context?: Input
}

export interface ResizeRequest extends JSONObject {
    filepath: string,
    exif?: ExifOptions,
    sizes: Size[]
}

export interface Input extends JSONObject {
    requests: ResizeRequest[]
}

export interface SizedImage extends JSONObject, Sized {
    base64: string
}

interface ExifJSON extends JSONObject {}

export interface ResizeResponse extends JSONObject {
    sizes: SizedImage[]
    exif?: ExifJSON
}

export interface Success extends IOutput {
    type: 'success'
    responses: ResizeResponse[]
}

export const asyncResize:
    (Input: Input) => Promise<Success | JSONError>
```

</details>

<details>
    
<summary>
        
catching possible errors ([source](https://github.com/Zemnmez/image.macro/blob/ab403a25ca517da8cb749d11c9248479beaebd71/src/resize.ts#L110))
    
</summary>
    
 ```typescript
        try {
            return {
                type: 'success',
                responses: await main()
            }
        } catch (e) {
            if (!(e instanceof Error)) return {
                type: 'error',
                name: 'weird error',
                message: 'something very odd has happened',
                context: { requests }
            }

            const { name, message, stack } = e;
            return {
                name, message, stack, type: 'error',
                context: { requests }
            }
        }
   ```
   
</details>


[image.macro]: https://github.com/Zemnmez/image.macro/blob/ab403a25ca517da8cb749d11c9248479beaebd71/src/resize.ts
[issue]: https://github.com/Zemnmez/do-sync/issues
