import { randomBytes } from "node:crypto";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { setInterval } from "node:timers/promises";

const twoGB = 2 * 1024 ** 3;

const basePath = new URL("./", import.meta.url).pathname;

const writeStream = createWriteStream(`${basePath}file`);

function progress(bytes) {
  process.stdout.clearLine();
  process.stdout.write(`${Math.floor((bytes / twoGB) * 100).toFixed(2)}%\r`);
}

async function* myReadable() {
  let bytes = 0;

  for await (const now of setInterval(1)) {
    const byte = randomBytes(1024 * 1024);
    bytes += byte.length;
    progress(bytes);
    if (bytes > twoGB) {
      break;
    }

    yield byte;
  }
}

await pipeline(myReadable, writeStream);
