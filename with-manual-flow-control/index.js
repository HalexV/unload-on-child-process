import { fork } from "child_process";
import { createReadStream } from "fs";
import { pipeline } from "stream/promises";
import { Writable } from "stream";
import { setTimeout } from "timers";

const basePath = new URL("../", import.meta.url).pathname;

const readStream = createReadStream(`${basePath}file`);

const PROCESS_COUNT = 1;

const replications = [];

const backgroundTaskFile = "./with-manual-flow-control/backgroundTask.js";

const processes = new Map();
let mainPipelineFinished = false;

for (let index = 0; index < PROCESS_COUNT; index++) {
  const child = fork(backgroundTaskFile, [`${basePath}file`]);

  child.isFree = true;

  child.on("exit", () => {
    console.log(`process ${child.pid} exited`);
    processes.delete(child.pid);
  });

  child.on("error", () => {
    console.log(`process ${child.pid} has an error`, error);
    process.exit(1);
  });

  child.on("message", (msg) => {
    // workaround para multiprocessamento
    if (replications.includes(msg)) return;

    if (msg === "free") {
      // console.log("free");
      if (mainPipelineFinished) {
        child.kill();
      }
      child.isFree = true;
      return;
    }
    if (msg === "busy") {
      // console.log("busy");
      child.isFree = false;
      return;
    }

    console.log(`${msg} is replicated!`);
    replications.push(msg);
  });
  processes.set(child.pid, child);
}

function roundRobin(array, index = 0) {
  return function () {
    if (index >= array.length) index = 0;

    return array[index++];
  };
}

// Pool de conexões, ou load balancer
const getProcess = roundRobin([...processes.values()]);
console.log(`starting with ${processes.size} processes`);

function asyncLoop(chunk, enc, cb) {
  let chosenProcess = {};
  chosenProcess.isFree = false;

  chosenProcess = getProcess();

  if (!chosenProcess.isFree) {
    setTimeout(() => {
      asyncLoop(chunk, enc, cb);
    }, 0);
    return;
  }

  chosenProcess.isFree = false;

  chosenProcess.send(chunk);
  return cb();
}

await pipeline(
  readStream,
  Writable({
    write(chunk, enc, cb) {
      setTimeout(() => {
        asyncLoop(chunk, enc, cb);
      }, 0);
    },
  })
);

mainPipelineFinished = true;

processes.forEach((child) => {
  if (!child.killed) child.kill();
});
