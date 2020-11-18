const { CpuLoad } = require('bindings')('threads_prof');

const {
  Worker,
  isMainThread,
  parentPort,
} = require('worker_threads');

const crypto = require('crypto');

const NS_PER_SEC = 1e9;

function getCpuUsage(prev) {

  const lastCpuUsage = process.cpuUsage();
  const lastHRTime = process.hrtime();

  const userCpuUsage = lastCpuUsage.user - prev.cpuUsage.user;
  const systemCpuUsage = lastCpuUsage.system - prev.cpuUsage.system;
  const time = (lastHRTime[0] - prev.hrTime[0]) * NS_PER_SEC + lastHRTime[1] - prev.hrTime[1];

  prev.cpuUsage = lastCpuUsage;
  prev.hrTime = lastHRTime;

  // cpuUsage - в микросекундах, time - в наносекундах
  const cpuUsage = (100000 * (userCpuUsage + systemCpuUsage) / time).toFixed(2);
  return(cpuUsage);
}

if (isMainThread) {

  console.log(`Started main thread pid=${process.pid}`);

  const cpuLoad = new CpuLoad();

  let prev = {
    cpuUsage: process.cpuUsage(),
    hrTime: process.hrtime(),
  };

  let workers = {};

  for (let n = 0; n < 2; n++) {
    const worker = new Worker(__filename);

    worker.on('online', () => {
      console.log(`Worker ${worker.threadId} started.`);
    });
    worker.on('message', (msg) => {
      console.log(`Message from worker ${worker.threadId}: ${msg}`);
    });
    worker.on('exit', () => {
      console.log(`Worker ${worker.threadId} died.`);
    });
    workers[n] = worker;
  }

  setInterval(() => {
    // console.time('JS');
    let cpuUsage = getCpuUsage(prev);
    // console.timeEnd('JS');

    // console.time('C');
    let cpuLoadAddon = cpuLoad.getProcessCpuLoad().toFixed(2);
    // console.timeEnd('C');

    console.log(`Main thread cpuUsage=${cpuUsage}% cpuLoad=${cpuLoadAddon}%`);

    // console.time('REPORT');
    // let report = process.report.getReport();
    // console.timeEnd('REPORT');

    // console.log('MAIN', process.pid, report.resourceUsage, report.uvthreadResourceUsage,
    //   report.workers[0].uvthreadResourceUsage, report.workers[1].uvthreadResourceUsage,
    // );
  }, 1000);

} else {

  const cpuLoad = new CpuLoad();

  setInterval(() => {

    let cnt = 10000;
    while (cnt--) crypto.randomBytes(cnt);

    let cpuThread = cpuLoad.getThreadCpuLoad().toFixed(2);

    parentPort.postMessage(`cpuThread=${cpuThread}%`);
  }, 1000);

}
