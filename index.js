const EventEmitter = require('events').EventEmitter;
const v8 = require('v8');
const { monitorEventLoopDelay, PerformanceObserver, constants } = require('perf_hooks');
const STATS_INTERVAL = 5 * 1000;
const RESOLUTION = 10;

const { CpuLoad } = require('bindings')('threads_prof');
const { initStats } = require('./initstats');

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
          switch (kind) {
            case constants.NODE_PERFORMANCE_GC_MINOR:
              this.stats.Scavenge_count++;
              this.stats.Scavenge_time += duration;
              break;
            case constants.NODE_PERFORMANCE_GC_MAJOR:
              this.stats.MarkSweepCompact_count++;
              this.stats.MarkSweepCompact_time += duration;
              break;
            case constants.NODE_PERFORMANCE_GC_INCREMENTAL:
              this.stats.IncrementalMarking_count++;
              this.stats.IncrementalMarking_time += duration;
              break;
            case constants.NODE_PERFORMANCE_GC_WEAKCB:
              this.stats.ProcessWeakCallbacks_count++;
              this.stats.ProcessWeakCallbacks_time += duration;
              break;
          }
        })
    });
  }

  start() {
    this.histogram.enable();
    this.resetStats();
    this.gcObserver.observe({entryTypes: ['gc'], buffered: true});
    this.statsInterval = setInterval(() => {
      this.emit('stats', this.getStats());
    }, this.options.interval)
  }

  stop() {
    this.histogram.disable();
    this.gcObserver.disconnect();
    clearInterval(this.statsInterval);
  }

  getStats() {
    Object.assign(this.stats, process.memoryUsage(),
      v8.getHeapSpaceStatistics().reduce((rv, space) => {
        switch (space.space_name) {
          case 'large_object_space':
            rv['large_object_space_total'] = space.space_size;
            rv['large_object_space_used'] = space.space_used_size;
            break;
          case 'old_space':
            rv['old_space_total'] = space.space_size;
            rv['old_space_used'] = space.space_used_size;
            break;
          case 'new_space':
            rv['new_space_total'] = space.space_size;
            rv['new_space_used'] = space.space_used_size;
            break;
          case 'code_space':
            rv['code_space_total'] = space.space_size;
            rv['code_space_used'] = space.space_used_size;
            break;
          case 'map_space':
            rv['map_space_total'] = space.space_size;
            rv['map_space_used'] = space.space_used_size;
            break;
        }
        return rv;
      }, {})
    );
    this.stats.processCpuLoad = this.cpuLoad.getProcessCpuLoad().toFixed(2);
    this.stats.threadCpuLoad = this.cpuLoad.getThreadCpuLoad().toFixed(2);
    this.stats.latency_p99 = this.histogram.percentile(99)/1000000 - this.options.resolution;

    let reportStats = Object.assign({}, this.stats);
    this.resetStats();

    return reportStats;
  }

  resetStats() {
    Object.assign(this.stats, initStats);
  }

}

module.exports = Stats;
