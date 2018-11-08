
const stops = require('../../lib/stops');
module.exports.tests = {};

// test exports
module.exports.tests.generateName = function(test, common) {
  // validate args
  test('generateName: empty rec', function(t) {
    var actual = stops.generateName(undefined, 'Acme', 'mylayer');
    t.equals(actual, '');
    t.end();
  });
  test('generateName: empty agency name', function(t) {
    t.throws(function(){
      stops.generateName({}, '', 'Acme');
    }, /invalid agency name/);
    t.end();
  });
  test('generateName: invalid agency name type', function(t) {
    t.throws(function(){
      stops.generateName({}, [], 'Acme');
    }, /invalid agency name/);
    t.end();
  });
  test('generateName: invalid layer name type (an empty string is used instead)', function(t) {
    var actual = stops.generateName({}, 'Acme', []);
    t.equals(actual, 'Acme');
    t.end();
  });

  // permutations of name generation
  test('generateName: agency name only', function(t) {
    var actual = stops.generateName({}, 'Acme');
    t.equals(actual, 'Acme');
    t.end();
  });
  test('generateName: agency name + layer name', function(t) {
    var actual = stops.generateName({}, 'Acme', 'MyLayer');
    t.equals(actual, 'Acme MyLayer');
    t.end();
  });
  test('generateName: stop_name only', function(t) {
    var actual = stops.generateName({
      stop_name: 'Test Stop'
    }, 'Acme');
    t.equals(actual, 'Test Stop (Acme Stop)');
    t.end();
  });
  test('generateName: stop_desc only', function(t) {
    var actual = stops.generateName({
      stop_desc: 'Test Stop'
    }, 'Acme');
    t.equals(actual, 'Test Stop (Acme Stop)');
    t.end();
  });
  test('generateName: stop_name + stop_code', function(t) {
    var actual = stops.generateName({
      stop_name: 'Test Stop',
      stop_code: '100'
    }, 'Acme');
    t.equals(actual, 'Test Stop (Acme Stop ID 100)');
    t.end();
  });

  // stop_name
  test('generateName: stop_name trimming', function(t) {
    var actual = stops.generateName({
      stop_name: '  Testing 123  '
    }, 'Acme');
    t.equals(actual, 'Testing 123 (Acme Stop)');
    t.end();
  });
  test('generateName: stop_name is string "null"', function(t) {
    var actual = stops.generateName({
      stop_name: 'null'
    }, 'Acme');
    t.equals(actual, 'Acme');
    t.end();
  });

  // stop_desc
  test('generateName: stop_desc trimming', function(t) {
    var actual = stops.generateName({
      stop_desc: '  Testing 123  '
    }, 'Acme');
    t.equals(actual, 'Testing 123 (Acme Stop)');
    t.end();
  });
  test('generateName: stop_desc is string "null"', function(t) {
    var actual = stops.generateName({
      stop_desc: 'null'
    }, 'Acme');
    t.equals(actual, 'Acme');
    t.end();
  });

  // stop_code
  test('generateName: stop_code trimming', function(t) {
    var actual = stops.generateName({
      stop_name: 'test',
      stop_code: '  Testing 123  '
    }, 'Acme');
    t.equals(actual, 'test (Acme Stop ID Testing 123)');
    t.end();
  });
  test('generateName: stop_code is string "null"', function(t) {
    var actual = stops.generateName({
      stop_name: 'test',
      stop_code: 'null'
    }, 'Acme');
    t.equals(actual, 'test (Acme Stop)');
    t.end();
  });

  // altname
  test('generateName: altname included', function(t) {
    var actual = stops.generateName({
      stop_name: 'Stop Name',
      stop_code: 'Alt Name'
    }, 'Acme');
    t.equals(actual, 'Stop Name (Acme Stop ID Alt Name)');
    t.end();
  });
  test('generateName: altname not included if duplicate of name', function(t) {
    var actual = stops.generateName({
      stop_name: 'Testing 123',
      stop_code: 'Testing 123'
    }, 'Acme');
    t.equals(actual, 'Testing 123 (Acme Stop)');
    t.end();
  });
  test('generateName: altname not included if duplicate of name - complex case', function(t) {
    var actual = stops.generateName({
      stop_name: '23300 Block NE Halsey',
      stop_code: '2330'
    }, 'Acme');
    t.equals(actual, '23300 Block NE Halsey (Acme Stop ID 2330)');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('stops: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};