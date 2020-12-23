# node-sysstat
Provides Node.JS system statistics in a 'stats' event, emitted in a configurable interval.

While working in the worker_thread environment collects statistics of the worker_thread itself.

## Install

```
npm install node-sysstat
```

## Example
```js
const Sysstat = require('node-sysstat');
let sysstat = new Sysstat({interval: 5});
sysstat.on('stats', (stats) => {
  console.log(stats);
})
```

## Result
```js
{
  'cpu.usage.process': '0.83',
  'cpu.usage.thread': '0.42',
  'latency.p99': 0.19084699999999977,
  'latency.mean': 0.08614296356275375,
  'latency.max': 0.6577909999999996,
  'latency.min': 0,
  'mem.rss': 17821696,
  'mem.heapTotal': 5697536,
  'mem.heapUsed': 3162536,
  'mem.external': 1555464,
  'mem.arrayBuffers': 9389,
  'mem.heap.large_object_space.used': 393272,
  'mem.heap.large_object_space.total': 401408,
  'mem.heap.old_space.used': 2278000,
  'mem.heap.old_space.total': 3026944,
  'mem.heap.new_space.used': 0,
  'mem.heap.new_space.total': 8288,
  'mem.heap.code_space.used': 182752,
  'mem.heap.code_space.total': 430080,
  'mem.heap.map_space.used': 271280,
  'mem.heap.map_space.total': 528384,
  'gc.Scavenge.count': 0,
  'gc.Scavenge.time': 0,
  'gc.MarkSweepCompact.count': 0.4,
  'gc.MarkSweepCompact.time': 0.9186854,
  'gc.IncrementalMarking.count': 0.4,
  'gc.IncrementalMarking.time': 0.020257,
  'gc.ProcessWeakCallbacks.count': 0.2,
  'gc.ProcessWeakCallbacks.time': 0.0013306,
  'gc.time': 0.940273
}
```
