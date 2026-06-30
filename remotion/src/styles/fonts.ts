// Font loading.
//
// Ships with Inter + Montserrat (loaded from Google Fonts, no files needed) so the
// project renders out of the box.
//
// TODO (brand): to use your own fonts, drop the .woff2/.ttf into
// remotion/public/fonts/ and register them with @remotion/fonts instead, e.g.:
//
//   import { loadFont } from "@remotion/fonts";
//   import { staticFile } from "remotion";
//   loadFont({ family: "CurioSans", url: staticFile("fonts/CurioSans.woff2") });
//   export const FONTS = { sans: "CurioSans", ... };

import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";

const inter = loadInter();
// Montserrat ExtraBold (800) for premium/bold looks. Falls back to Inter Bold.
const montserrat = loadMontserrat("normal", { weights: ["700", "800"] });

export const FONTS = {
  // Keys referenced by the style registry. Swap these values for your brand families.
  sans: inter.fontFamily,
  display: inter.fontFamily,
  mono: inter.fontFamily,
  premium: `${montserrat.fontFamily}, ${inter.fontFamily}`, // Montserrat ExtraBold, fallback Inter
};
