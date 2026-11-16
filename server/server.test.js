const test=require('node:test'),assert=require('node:assert/strict');
const {cleanName,allowed}=require('./index');
test('device names are cleaned and limited',()=>{assert.equal(cleanName('  Living room TV  '),'Living room TV');assert.equal(cleanName('x'.repeat(60)).length,40);assert.equal(cleanName(''),'EcoOne device')});
test('only allow-listed Home Assistant actions pass',()=>{assert.equal(allowed('light','turn_on'),true);assert.equal(allowed('media_player','media_pause'),true);assert.equal(allowed('lock','unlock'),false);assert.equal(allowed('light','delete'),false)});
