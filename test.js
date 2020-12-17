const Sysstat = require('./');
const STAT_INTERVAL = 5;

const {
  Worker,
  isMainThread,
  parentPort,
} = require('worker_threads');

const crypto = require('crypto');

if (isMainThread) {

  console.log(`Started main thread pid=${process.pid}`);

  const sysstat = new Sysstat({interval: STAT_INTERVAL});
  sysstat.on('stats', (stats) => {
    console.log(`Main thread statistics: ${JSON.stringify(stats)}`);
  });

  let workers = {};

  for (let n = 0; n < 2; n++) {
    const worker = new Worker(__filename);

    worker.on('online', () => {
      console.log(`Worker ${worker.threadId} started.`);
    });
    worker.on('message', (msg) => {
      console.log(`Message from worker ${worker.threadId}: ${JSON.stringify(msg)}`);
    });
    worker.on('exit', () => {
      console.log(`Worker ${worker.threadId} died.`);
    });
    workers[n] = worker;
  }
} else {

  const sysstat = new Sysstat({interval: STAT_INTERVAL});
  sysstat.on('stats', (stats) => {
    parentPort.postMessage(stats);
  });

  setInterval(() => {
    let cnt = 10000;
    let a = [];
    while (cnt--) a.push(crypto.randomBytes(cnt));
  }, 1000);

}
