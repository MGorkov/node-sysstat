const EventEmitter = require('events').EventEmitter;
const v8 = require('v8');
const { monitorEventLoopDelay, PerformanceObserver, constants } = require('perf_hooks');
const STATS_INTERVAL = 5;
const RESOLUTION = 10;

const { CpuLoad } = require('bindings')('sysstat');
const { initStats, statKeys, gcStatKeys } = require('./initstats');

class Stats extends EventEmitter {
  constructor(options) {
    super();
    this.options = options || {};
    this.options.interval = this.options.interval || STATS_INTERVAL;
    this.options.resolution = this.options.resolution || RESOLUTION;
    this.init();
    this.start();
  }

  init() {
    this.stats = {};
    this.cpuLoad = new CpuLoad();
    this.histogram = monitorEventLoopDelay({ resolution: this.options.resolution });
    this.gcObserver = new PerformanceObserver((list) => {
      list
        .getEntries()
        .map(({kind, duration}) => {
          this.stats['gc.time'] += duration;
          switch (kind) {
            case constants.NODE_PERFORMANCE_GC_MINOR:
              this.stats['gc.Scavenge.count']++;
              this.stats['gc.Scavenge.time'] += duration;
              break;
            case constants.NODE_PERFORMANCE_GC_MAJOR:
              this.stats['gc.MarkSweepCompact.count']++;
              this.stats['gc.MarkSweepCompact.time'] += duration;
              break;
            case constants.NODE_PERFORMANCE_GC_INCREMENTAL:
              this.stats['gc.IncrementalMarking.count']++;
              this.stats['gc.IncrementalMarking.time'] += duration;
              break;
            case constants.NODE_PERFORMANCE_GC_WEAKCB:
              this.stats['gc.ProcessWeakCallbacks.count']++;
              this.stats['gc.ProcessWeakCallbacks.time'] += duration;
              break;
          }
        })
    });
  }

  start() {
    if (this.running) return;
    this.histogram.enable();
    this.resetStats();
    this.gcObserver.observe({entryTypes: ['gc'], buffered: true});
    this.statsInterval = setInterval(() => {
      this.emit('stats', this.getStats());
    }, this.options.interval * 1000);
    this.running = true;
  }

  stop() {
    this.histogram.disable();
    this.gcObserver.disconnect();
    clearInterval(this.statsInterval);
    this.running = false;
  }

  getStats() {
    const memoryUsage = process.memoryUsage();
    this.stats['mem.rss'] = memoryUsage.rss;
    this.stats['mem.heapTotal'] = memoryUsage.heapTotal;
    this.stats['mem.heapUsed'] = memoryUsage.heapUsed;
    this.stats['mem.external'] = memoryUsage.external;
    this.stats['mem.arrayBuffers'] = memoryUsage.arrayBuffers;
    Object.assign(this.stats,
      v8.getHeapSpaceStatistics().reduce((rv, space) => {
        switch (space.space_name) {
          case 'large_object_space':
            rv['mem.heap.large_object_space.total'] = space.space_size;
            rv['mem.heap.large_object_space.used'] = space.space_used_size;
            break;
          case 'old_space':
            rv['mem.heap.old_space.total'] = space.space_size;
            rv['mem.heap.old_space.used'] = space.space_used_size;
            break;
          case 'new_space':
            rv['mem.heap.new_space.total'] = space.space_size;
            rv['mem.heap.new_space.total'] = space.space_used_size;
            break;
          case 'code_space':
            rv['mem.heap.code_space.total'] = space.space_size;
            rv['mem.heap.code_space.used'] = space.space_used_size;
            break;
          case 'map_space':
            rv['mem.heap.map_space.total'] = space.space_size;
            rv['mem.heap.map_space.used'] = space.space_used_size;
            break;
        }
        return rv;
      }, {})
    );
    this.stats['cpu.usage.process'] = this.cpuLoad.getProcessCpuLoad().toFixed(2);
    this.stats['cpu.usage.thread'] = this.cpuLoad.getThreadCpuLoad().toFixed(2);
    this.stats['latency.p99'] = this.histogram.percentile(99)/1000000 - this.options.resolution;
    this.stats['latency.mean'] = this.histogram.mean/1000000 - this.options.resolution;
    this.stats['latency.max'] = this.histogram.max/1000000 - this.options.resolution;
    this.stats['latency.min'] = this.histogram.min/1000000 > this.options.resolution ? this.histogram.min/1000000 - this.options.resolution : 0;
    this.histogram.reset();

    gcStatKeys.forEach((key) => {
      this.stats[key] /= this.options.interval;
    });

    let reportStats = Object.assign({}, this.stats);
    this.resetStats();

    return reportStats;
  }

  resetStats() {
    Object.assign(this.stats, initStats);
  }

  static statKeys() {
    return statKeys;
  }

}

module.exports = Stats;
