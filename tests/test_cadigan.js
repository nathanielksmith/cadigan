var m = require('akeley')
var rewire = require('rewire')

var cadigan = rewire('../lib/cadigan')

exports.test_init = {
    setUp: function(cb) {
        this.mock_existsSync = m.create_func()
        this.mock_mkdirSync = m.create_func()
        cadigan.__set__('fs', {
            existsSync: this.mock_existsSync,
            mkdirSync: this.mock_mkdirSync
        })
        this.mock_ds_open = m.create_func()
        cadigan.__set__('ds', {
            open: this.mock_ds_open
        })
        cb()
    },
    tearDown: function(cb) {
        this.mock_existsSync.reset()
        this.mock_mkdirSync.reset()
        this.mock_ds_open.reset()
        delete cadigan.store
        cb()
    },
    test_no_paths: function(test) {
        this.mock_existsSync.return_value = false
        this.mock_ds_open.func = function(path, cb) {
            cb(null, 'hi')
        }
        cadigan.init(function(err) {
            test.ok(!err, 'saw no error')
            test.equal(cadigan.store, 'hi', 'store set')
            test.equal(this.mock_existsSync.calls, 2, 'called exists twice')
            test.equal(this.mock_mkdirSync.calls, 2, 'called mkdir twice')
            test.done()
        }.bind(this))
    },
    test_paths: function(test) {
        this.mock_existsSync.return_value = true
        this.mock_ds_open.func = function(path, cb) {
            cb(null, 'hi')
        }
        cadigan.init(function(err) {
            test.ok(!err, 'saw no error')
            test.equal(cadigan.store, 'hi', 'store set')
            test.equal(this.mock_existsSync.calls, 2, 'called exists twice')
            test.equal(this.mock_mkdirSync.calls, 0, 'did not call mkdir')
            test.done()
        }.bind(this))
    },
    test_ds_error: function(test) {
        this.mock_ds_open.func = function(path, cb) {
            cb('error')
        }
        cadigan.init(function(err) {
            test.equal(err, 'error', 'see error')
            test.ok(!cadigan.store, 'no store set')
            test.done()
        })
    }
}

exports.test_now = {
    test_now: function(test) {
        var mock_Date = function() {
            this.getTime = m.noop
        }
        mock_Date.now = function() { return 10000 }
        cadigan.__set__('Date', mock_Date)
        test.equal(cadigan.now(), 10, 'converting date')
        test.done()
    }
}

exports.test_meta = {
    setUp: function(cb) {
        this.mock_store = {
            get: m.create_func()
        }
        cadigan.store = this.mock_store
        cb()
    },
    tearDown: function(cb) {
        this.mock_store.get.reset()
        cb()
    },
    test_error: function(test) {
        this.mock_store.get.func = function(key, cb) {
            cb('error')
        }
        cadigan.meta(function(err, meta) {
            test.ok(!meta, 'got no meta')
            test.equal(err, 'error', 'see error')
            test.done()
        })
    },
    test_success: function(test) {
        this.mock_store.get.func = function(key, cb) {
            cb(null, {hi:'there'})
        }
        cadigan.meta(function(err, meta) {
            test.ok(!err, 'see no error')
            test.equal(meta.hi, 'there', 'got meta')
            test.done()
        })
    }
}

exports.test_new = {
    setUp: function(cb) {
        cadigan.now = m.create_func({
            return_value: 10
        })
        this.mock_store = { save: m.create_func() }
        cadigan.store = this.mock_store
        cb()
    },
    tearDown: function(cb) {
        this.mock_store.save.reset()
        cb()
    },
    test_success: function(test) {
        this.mock_store.save.func = function(doc, cb) {
            doc._id = 123
            cb(null, doc)
        }
        var post = {}
        cadigan.new(post, function(err, doc) {
            test.ok(!err, 'no error')
            test.equal(doc.created, 10, 'see created')
            test.equal(doc.updated, 10, 'see updated')
            test.done()
        })
    },
    test_ds_error: function(test) {
        this.mock_store.save.func = function(doc, cb) {
            cb('error')
        }
        var post = {}
        cadigan.new(post, function(err, doc) {
            test.equal(err, 'error', 'see error')
            test.ok(!doc, 'no doc passed')
            test.ok(!post.created, 'nothing added to post')
            test.ok(!post.updated, 'nothing added to post')
            test.done()
        })
    }
}

exports.test_get = {
    setUp: function(cb) {
        this.mock_store = { get: m.create_func() }
        cadigan.store = this.mock_store
        cb()
    },
    tearDown: function(cb) {
        this.mock_store.get.reset()
        cb()
    },
    test_ds_error: function(test) {
        this.mock_store.get.func = function(id, cb) {
            cb('error')
        }
        cadigan.get(123, function(err, doc) {
            test.equal(err, 'error', 'see error')
            test.ok(!doc, 'no doc')
            test.done()
        })
    },
    test_success: function(test) {
        this.mock_store.get.func = function(id, cb) {
            cb(null, {hi:'there'})
        }
        cadigan.get(123, function(err, doc) {
            test.ok(!err, 'no error')
            test.equal(doc.hi, 'there', 'got doc')
            test.done()
        })
    }
}

test_publish = {}
test_unpublish = {}
test_update = {}
test_delete = {}
test_search = {}
test_list = {}
