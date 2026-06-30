# Brand fonts

Drop your brand font files here (`.woff2` preferred, `.ttf` works) and register
them in `../../src/styles/fonts.ts`.

Example (`fonts.ts`):

```ts
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

loadFont({ family: "YourBrandFont", url: staticFile("fonts/YourBrandFont.woff2") });

export const FONTS = {
  sans: "YourBrandFont",
  display: "YourBrandFont",
  mono: "YourBrandFont",
};
```

Out of the box the project loads **Inter** from Google Fonts, so it renders with
no files present. Replace it whenever your real fonts are ready.
