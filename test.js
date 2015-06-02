const test = require('tape')
const wayfarer = require('./')

test('should match a path', function (t) {
  t.plan(1)
  const r = wayfarer()
  r.on('/', function () {
    t.pass('called')
  })
  r('/')
})

test('should match a default path', function (t) {
  t.plan(1)
  const r = wayfarer('/404')
  r.on('/404', function () {
    t.pass('default')
  })
  r('/nope')
})

test('.on() should catch type errors', function (t) {
  t.plan(2)
  const r = wayfarer()
  t.throws(r.on.bind(r, 123), /string/)
  t.throws(r.on.bind(r, '/hi', 123), /function/)
})

test('.emit() should match partials', function (t) {
  t.plan(2)
  const r = wayfarer()
  r.on('/:user', function (uri, param) {
    t.equal(uri, '/tobi')
    t.equal(param.user, 'tobi')
  })
  r('/tobi')
})

test('.emit() should throw if no matches are found', function (t) {
  t.plan(1)
  const r1 = wayfarer()
  t.throws(r1.bind(r1, '/woops'), /path/)
})

test('.emit() should allow nesting', function (t) {
  t.plan(5)

  const r1 = wayfarer()
  const r2 = wayfarer()
  r1.on('/home', r2)
  r2.on('/', function (uri) {
    t.equal(uri, '/')
  })

  r1('/home')

  const r3 = wayfarer()
  const r4 = wayfarer()
  r3.on('/parent', r4)
  r4.on('/child', function (uri) {
    t.equal(uri, '/child')
  })

  r3('/parent/child')

  const r5 = wayfarer()
  const r6 = wayfarer()
  r5.on('/:parent', r6)
  r6.on('/child', function (uri, param) {
    t.equal(typeof param, 'object')
    t.equal(param.parent, 'hello')
    t.equal(uri, '/child')
  })

  r5('/hello/child')
})

test('aliases', function (t) {
  t.plan(1)
  const r = wayfarer()
  t.equal(r, r.emit)
})

test('.match()', function (t) {
  t.plan(3)
  const r = wayfarer()

  r.on('/user/:id', function (uri) {
    t.equal(uri, '/user/once', 'route not called with .match()')
  })

  r('/user/once')

  const matched = r.match('/user/matched')
  t.equal(matched.param.id, 'matched')
  t.equal(typeof matched.node.cb, 'function')
})
