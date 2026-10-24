// node face.mjs <out-dir> -> bot-face.svg (button icon) and bot-face-badge.svg (the new bot's badge).
//
// The face is DiceBear's Adventurer Neutral, the pack Happy Desktop gives new bots (BotFace.tsx), drawn by
// Lisa Wischofsky (CC BY 4.0): sunglasses, one raised brow and a smile. Here it loses its colours: the
// ground becomes an outlined rounded square like the other button icons, ink stays ink, and the mouth's
// fills turn white inside their ink outline.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
// The DiceBear packages happy-desktop bundles: HAPPY_DESKTOP=~/Developer/happy-desktop node face.mjs assets
const pnpm = `${process.env.HAPPY_DESKTOP ?? `${process.env.HOME}/Developer/happy-desktop`}/node_modules/.pnpm`;
const { Avatar, Style } = await import(`${pnpm}/@dicebear+core@10.7.0/node_modules/@dicebear/core/lib/index.js`);
const { default: def } = await import(`${pnpm}/@dicebear+styles@10.6.0/node_modules/@dicebear/styles/src/adventurer-neutral.json`, { with: { type: "json" } });

const INK = "#18171c";
const out = process.argv[2] ?? ".";
// Marker colours, swapped below, so each part of the face can be told apart in the markup.
let face = new Avatar(new Style(def), {
    seed: "posthog-alerts",
    glassesVariant: "variant01",
    glassesProbability: 100,
    mouthVariant: "variant01",
    backgroundColor: ["#010203"],
    inkColor: ["#000001"],
    eyesColor: ["#000002"],
    glassesColor: ["#000003"],
    scleraColor: ["#fffff1"],
    teethColor: ["#fffff2"],
    lipsColor: ["#f00001"],
    throatColor: ["#f00002"],
    tongueColor: ["#f00003"],
    uvulaColor: ["#f00004"],
}).toString();
face = face
    .replace(/<metadata.*?<\/metadata>/s, "")
    .replace(/<!--.*?-->/gs, "")
    .replace(/<rect[^>]*fill="#010203"[^>]*\/>/g, "")
    .replace(/#00000[123]/gi, INK)
    .replace(/#fffff[12]|#f0000[1-4]/gi, "#ffffff")
    .replace(/^<svg[^>]*>|<\/svg>$/g, "");
if (/#0102|#0000|#ffff[f]?[0-9]|#f000/i.test(face)) throw new Error("a colour was not swapped");

/** The face in a rounded square, on a 24-unit grid like the Lucide icons beside it. */
const icon = (stroke, ground) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
    `<rect x="2" y="2" width="20" height="20" rx="6" fill="${ground}" stroke="${INK}" stroke-width="${stroke}"/>` +
    `<svg x="3.6" y="3.4" width="16.8" height="16.8" viewBox="0 0 400 400">${face}</svg></svg>\n`;

mkdirSync(out, { recursive: true });
writeFileSync(join(out, "bot-face.svg"), icon(1.9, "none"));
writeFileSync(join(out, "bot-face-badge.svg"), icon(1.1, "#ffffff"));
console.log("wrote", join(out, "bot-face.svg"), join(out, "bot-face-badge.svg"));
