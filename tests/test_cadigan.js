var m = require('akeley')
var _ = require('underscore')
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

var mock_store = {
    init: function() {
        this =_.extend(this, {
            get: m.create_func(),
            save: m.create_func(),
            remove: m.create_func(),
            scan: m.create_func()
        })
        return this
    },
    reset: function() {
        console.log(this)
        ['get', 'save', 'remove', 'scan'].forEach(function(x) { this[x].reset() })
    }
}

exports.test_meta = {
    setUp: function(cb) {
        cadigan.store = Object.create(mock_store.init())
        cb()
    },
    tearDown: function(cb) {
        cadigan.store.reset()
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
        cadigan.store = this.mock_store = Object.create(mock_store.init())
        cb()
    },
    tearDown: function(cb) {
        this.mock_store.reset()
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
        cadigan.store = this.mock_store = Object.create(mock_store.init())
        cb()
    },
    tearDown: function(cb) {
        this.mock_store.reset()
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

exports.test_publish = {
    setUp: function(cb) {
        cadigan.store = this.mock_store = Object.create(mock_store.init())
        cb()
    },
    tearDown: function(cb) {
        this.mock_store.reset()
        cb()
    },
    test_bad_id: function(test) {
        this.mock_store.get.func = function(id, cb) {
            cb('error')
        }
        cadigan.publish(123, function(err, doc) {
            test.equal(err, 'error', 'see error')
            test.ok(!doc, 'no doc')
            test.done()
        })
    },
    test_failed_save: function(test) {
        this.mock_store.get.func = function(id, cb) {
            cb(null, {published: false, _id:123})
        }
        this.mock_store.save.func = function(post, cb) {
            cb('error saving')
        }
        cadigan.publish(123, function(err, doc) {
            test.equal(err, 'error saving')
            test.ok(!doc, 'no doc')
            test.done()
        })
    },
    test_success: function(test) {
        this.mock_store.get.func = function(id, cb) {
            cb(null, {})
        }
        this.mock_store.save.func = function(doc, cb) {
            cb(null, doc)
        }
        cadigan.publish(123, function(err, post) {
            test.ok(!err, 'no error')
            test.ok(post.published, 'published set')
            test.done()
        })
    }
}

exports.test_unpublish = {
    setUp: function(cb) {
        cadigan.store = this.mock_store = Object.create(mock_store.init())
        cb()
    },
    tearDown: function(cb) {
        this.mock_store.reset()
        cb()
    },
    test_bad_id: function(test) {
        this.mock_store.get.func = function(id, cb) {
            cb('error')
        }
        cadigan.unpublish(123, function(err, doc) {
            test.equal(err, 'error', 'see error')
            test.ok(!doc, 'no doc')
            test.done()
        })
    },
    test_failed_save: function(test) {
        this.mock_store.get.func = function(id, cb) {
            cb(null, {published: false, _id:123})
        }
        this.mock_store.save.func = function(post, cb) {
            cb('error saving')
        }
        cadigan.unpublish(123, function(err, doc) {
            test.equal(err, 'error saving')
            test.ok(!doc, 'no doc')
            test.done()
        })
    },
    test_success: function(test) {
        this.mock_store.get.func = function(id, cb) {
            cb(null, {})
        }
        this.mock_store.save.func = function(doc, cb) {
            cb(null, doc)
        }
        cadigan.unpublish(123, function(err, post) {
            test.ok(!err, 'no error')
            test.equal(post.published, false, 'published unset')
            test.done()
        })
    }
}

exports.test_update = {
    setUp: function(cb) {
        cadigan.store = this.mock_store = Object.create(mock_store.init())
        cb()
    },
    tearDown: function(cb) {
        this.mock_store.reset()
        cb()
    },
    test_bad_id: function(test) {
        this.mock_store.get.func = function(id, cb) {
            cb('error')
        }
        cadigan.update(123, {title:'hi'}, function(err, post) {
            test.equal(err, 'error', 'see error')
            test.ok(!post, 'no post passed')
            test.done()
        })
    },
    test_failed_save: function(test) {
        this.mock_store.get.func = function(id, cb) {
            cb(null, {title:'hola', _id:123})
        }
        this.mock_store.save.func = function(post, cb) {
            cb('error saving')
        }
        cadigan.update(123, {title:'hi'}, function(err, doc) {
            test.equal(err, 'error saving')
            test.ok(!doc, 'no doc')
            test.done()
        })
    },
    test_success: function(test) {
        var post = {title:'hi'}
        this.mock_store.get.func = function(id, cb) {
            post._id = 123
            cb(null, post)
        }
        this.mock_store.save.func = function(id, cb) {
            cb(null, post)
        }
        cadigan.update(123, {title:'hola', tags:['hi', 'there']}, function(err, post) {
            test.ok(!err, 'no error')
            test.equal(post.title, 'hola', 'new title')
            test.deepEqual(post.tags, ['hi', 'there'], 'new tags')
            test.done()
        })
    }
}

exports.test_delete = {
    setUp: function(cb) {
        cadigan.store = this.mock_store = Object.create(mock_store.init())
        cb()
    },
    tearDown: function(cb) {
        this.mock_store.reset()
        cb()
    },
    test_bad_id: function(test) {
        this.mock_store.remove.func = function(id, cb) {
            cb('error')
        }
        cadigan.delete(123, function(err) {
            test.equal(err, 'error', 'see error')
            test.done()
        })
    },
    test_success: function(test) {
        this.mock_store.remove.func = function(id, cb) {
            cb(null)
        }
        cadigan.delete(123, function(err) {
            test.ok(!err, 'no error')
            test.done()
        })
    }
}

exports.test_search = {
    setUp: function() {
        cadigan.store = this.mock_store = Object.create(mock_store.init())
        cb()
    }
}
test_list = {}
