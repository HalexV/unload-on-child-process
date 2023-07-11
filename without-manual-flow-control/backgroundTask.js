import { createReadStream } from "fs";
import { pipeline } from "stream/promises";
import { setInterval } from "timers/promises";

const database = process.argv[2];

async function* myWritable(stream) {
  let iterations = 0;

  for await (const chunk of stream) {
    if (iterations === 1) {
      for await (const now of setInterval(1)) {
      }
    }

    iterations += 1;
  }
}

async function onMessage(msg) {
  console.log("onMessage called");
  await pipeline(createReadStream(database), myWritable);
}

process.on("message", onMessage);
