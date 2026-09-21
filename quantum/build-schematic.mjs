import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const svgPath = path.join(here, "quantum-schematic.svg");
const fonts = {
  SemiSqueezed: path.join(root, "assets/fonts/SemiSqueezedMedium.DVwdXl-1.woff2"),
  Graphik: path.join(root, "assets/fonts/Graphik-Regular-Web.C0YoM5Bw.woff2"),
  PPNeueMontrealMono: path.join(root, "assets/fonts/PPNeueMontrealMono-Book.D9DlBA0F.woff2"),
};

const b64 = (file) => fs.readFileSync(file).toString("base64");
const fontCss = Object.entries(fonts)
  .map(([name, file]) => `@font-face{font-family:${name};src:url(data:font/woff2;base64,${b64(file)}) format('woff2');font-weight:400;font-style:normal}`)
  .join("");
const fontBlock = `<!-- QUANTUM_FONT_BLOCK_START --><style>${fontCss} text{font-synthesis:none} .hubert-wordmark{font-family:SemiSqueezed!important} .title{font-family:SemiSqueezed!important;font-weight:500;letter-spacing:.01em} .note{fill:#faf6af!important} .subtitle{font-family:Graphik!important} .label{font-family:PPNeueMontrealMono!important}</style><!-- QUANTUM_FONT_BLOCK_END -->`;

let svg = fs.readFileSync(svgPath, "utf8")
  .replace(/\r\n/g, "\n");
svg = svg.replace("fill=\"#000d18\"", "fill=\"#04111f\"")
  .replaceAll("#c8deec", "#abbac2")
  .replaceAll("#7ca4bd", "#79b0cc")
  .replaceAll("#a8d3e8", "#79b0cc")
  .replaceAll("font-family=\"Arial Narrow, Arial, sans-serif\"", "font-family=\"Graphik\"")
  .replaceAll("font-family=\"Arial, sans-serif\"", "font-family=\"Graphik\"")
  .replaceAll("font-family=\"monospace\"", "font-family=\"PPNeueMontrealMono\"")
  .replace("<text x=\"80\" y=\"190\"", "<text class=\"title note\" x=\"80\" y=\"190\"")
  .replace("<text x=\"80\" y=\"240\"", "<text class=\"subtitle\" x=\"80\" y=\"240\"")
  .replace(/<!-- QUANTUM_FONT_BLOCK_START -->[\s\S]*?<!-- QUANTUM_FONT_BLOCK_END -->/g, "");

// Removing the generated block can leave an extra blank line before the
// legacy embedded HubertDisplay face. Normalize it for byte-stable rebuilds.
svg = svg.replace(/(?:\n[ \t]*){2,}(?=<style>@font-face\{font-family:HubertDisplay)/g, "\n  ");

// Upgrade the first run from the old unmarked generated form, or inject once
// into a clean source SVG. The original HubertDisplay style is retained.
if (/<style>@font-face\{font-family:SemiSqueezed/.test(svg)) {
  svg = svg.replace(/<style>@font-face\{font-family:SemiSqueezed[\s\S]*?<\/style><style>/, `${fontBlock}<style>`);
} else {
  svg = svg.replace(/(<svg[^>]*>)/, `$1\n  ${fontBlock}`);
}
fs.writeFileSync(svgPath, svg);
console.log(`Wrote ${svgPath}`);
