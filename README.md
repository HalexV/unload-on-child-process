# Concept Test: Unload on child process

This project is about a main process using node streams to sending data to child processes to do some processing.

The concept test consists of two scenarios:

1. Main process sending data to child processes without flow control, i.e., main process does not wait until a child process is free.
2. Main process sending data to child processes only when a child process is free.

In both scenarios, It is simulated a slow processing in the child processes. In that case, an infinite async loop was created to simulate this behavior.

The goal of this concept test is understand that when we working with node streams, we need to be careful to not make a memory leak. Even using the pipeline, with node taking care of node stream flow, we can see that without controlling the dynamic between main process and child processes we can generate a memory leak.

By default, both versions spawn 1 child process. If you want to spawn more than 1, change the variable `PROCESS_COUNT` in each `index.js`.

### It's interesting to use a process monitor to see the differences on memory usage of each code.

On linux you can use top:

1. Open a terminal
2. Run top
3. Press `e` to change memory measure to MB.
4. Press `Ctrl+o` and write COMMAND=node to filter by node process.

### Steps to execute the codes:

1. Generate a 2GB file running the command `npm run generate-file`.
2. Execute the command `npm run with-manual-flow-control` or `npm run without-manual-flow-control`.

### Expected Results

Scenarios:

1. A great memory leak.
2. No memory leak.
