
var tape = require('tape');
var common = {};

var tests = [
  require('./lib/stops')
];

tests.map(function(t) {
  t.all(tape, common);
});
