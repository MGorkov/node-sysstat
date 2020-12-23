const Sysstat = require('../');
const STAT_INTERVAL = 5;
const assert = require('assert');
const { statKeys } = require('../initstats');

const sysstat = new Sysstat({interval: STAT_INTERVAL});

describe('node-sysstat', function() {
  it('should generate "stats" event', function(done) {
    sysstat.on('stats', (stats) => {
      sysstat.stop();
      done();
      describe('checking stats object', function() {
        it('should be an object', function() {
          assert.equal(typeof stats, 'object');
        });
        statKeys.forEach((key) => {
          it(`should be "${key}" property`, function() {
            assert.equal(typeof stats, 'object');
          });
        })
      })
    });
  })
});
