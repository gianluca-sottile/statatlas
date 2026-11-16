/* Speed control 0..100: monotonic continuous interpolation and frame budget. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/core/ui.js'), 'utf8'), context);
const { speedRate, speedBatch } = context.window.SA.ui;
function near(value, expected) { assert(Math.abs(value-expected) < 1e-9, [value,expected]); }
near(speedRate(0), 2);
near(speedRate(25), 30);
near(speedRate(100), 1200);
assert(speedRate(25.5) > speedRate(25));
assert(speedRate(25.5) < speedRate(26));
for (let x = 1; x <= 1000; x++) {
  const a = speedRate((x-1)/10), b = speedRate(x/10);
  assert(b > a, 'speed must be strictly increasing');
}
const p = {speed: 25, lastTick: null, speedCredit:0};
assert.strictEqual(speedBatch(p, 0),1,'immediate first step');
assert.strictEqual(speedBatch(p, 50),1,'30 steps/sec over 50 ms');
assert.strictEqual(speedBatch(p, 100),2,'fractional budget carries over');
p.speed=100;
assert.strictEqual(speedBatch(p, 200),24,'heavy animation has per-frame ceiling');
assert.strictEqual(speedBatch(p, 201),2,'no large backlog from long frame');
p.lastTick=null;
p.speedCredit=0;
assert.strictEqual(speedBatch(p, 2000),1,'restarted animation has one prompt step');
console.log('PASS speed 0-100, 25 default, monotone mapping, fractional scheduling, cap and reset');
