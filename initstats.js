const gcStatKeys = [
  'gc.Scavenge.count',
  'gc.Scavenge.time',
  'gc.MarkSweepCompact.count',
  'gc.MarkSweepCompact.time',
  'gc.IncrementalMarking.count',
  'gc.IncrementalMarking.time',
  'gc.ProcessWeakCallbacks.count',
  'gc.ProcessWeakCallbacks.time',
  'gc.time'
];

const statKeys = [
  'cpu.usage.process',
  'cpu.usage.thread',
  'latency.p99',
  'latency.mean',
  'latency.max',
  'latency.min',
  'mem.rss',
  'mem.heapTotal',
  'mem.heapUsed',
  'mem.external',
  'mem.arrayBuffers',
  'mem.heap.large_object_space.used',
  'mem.heap.large_object_space.total',
  'mem.heap.old_space.used',
  'mem.heap.old_space.total',
  'mem.heap.new_space.used',
  'mem.heap.new_space.total',
  'mem.heap.code_space.used',
  'mem.heap.code_space.total',
  'mem.heap.map_space.used',
  'mem.heap.map_space.total',
  ...gcStatKeys
];

const initStats = statKeys.reduce((rv, key) => {
  rv[key] = 0;
  return rv;
}, {});

module.exports = {
  statKeys,
  initStats,
  gcStatKeys,
};
