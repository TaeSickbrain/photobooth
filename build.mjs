import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, basename } from "node:path";

const mime = {
  "png": "image/png",
};

const assetFiles = await readdir("./assets");
const assetData = await Promise.all(assetFiles.map(async (f) => {
  const buf = await readFile(`./assets/${f}`);
  const ext = extname(f);
  const name = basename(f, ext);
  return [name, [mime[ext.slice(1)] ?? "", buf.toString("base64")]];
}));

const outFile = `\
const assets = ${JSON.stringify(Object.fromEntries(assetData), null, 2)};

${getAsset}
`

writeFile("assets.js", outFile);

function getAsset(ident) {
  if (!assets[ident]) {
    console.error("Unknown asset", ident);
    return "";
  }
  const [type, data] = assets[ident];
  return `data:${type};base64,${data}`;
}
