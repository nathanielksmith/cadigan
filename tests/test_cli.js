var m = require('akeley')
var rewire = require('rewire')

var cli = require('../lib/cli')

var cli = rewire('../lib/cli')
cli.__set__('fs', {
    readFile: function(filename, cb) {
        cb(null, 'thundering clap')
    },
    writeFileSync: m.noop
})


cli.__set__('readline', {
    createInterface: function() {
        return {
            question: function(prmpt, cb) { cb('answer') }
        }
    }
})


var cadigan = require('../lib/cadigan')
cadigan.new = m.create_func()
cadigan.get = m.create_func({func:function(id, cb) {
    cb(null, {
        _id: id,
        title: 'great title',
        tags: ['hi', 'there'],
        content: ['awesome post'],
        published: true
    })
}})
cadigan.update = m.create_func({func:function(id, doc, cb) { cb(null) }})

var common_setup = function(cb) {
    cli.__set__('cadigan', cadigan)
    cadigan.new.reset()
    cadigan.update.reset()
    cli.editor = function(filename, cb) { cb(0) }

    cb()
}

exports.test_new = {
    setUp: common_setup,
    test_no_args: function(test) {
        var e
        cli.new([], function(err) {
            e = err
        })
        test.equal(e, 'no title provided', 'proper error')
        test.done()
    },
    test_edit_fail: function(test) {
        cli.editor = function(f, cb) { cb(1) }
        var e
        cli.new(['title'], function(err) { e = err })
        test.equal(e, 'editor failed', 'proper error')
        test.done()
    },
    test_no_tags: function(test) {
        var e
        cli.__set__('readline', {
            createInterface: function(){
                return {
                    question: function(p, cb) { cb('') },
                    close: m.noop
                }
            },
        })
        cli.new(['good title'], function(err) { e = err })
        test.ok(!e, 'no error')
        var post = cadigan.new.args[0][0]
        test.equal(post.published, false, 'unpublished by default')
        test.deepEqual(post.tags, [], 'no tags')
        test.equal(post.title, 'good title', 'see title')
        test.done()
    },
    test_weird_tags: function(test) {
        var e
        cli.__set__('readline', {
            createInterface: function() {
                return {
                    question: function(p, cb) {
                        cb('gaslark:humbug,,fiend$!bocarce,,,123934-p.   alphabet')
                    },
                    close: m.noop
                }
            }
        })
        cli.new(['title'], function(err) {e=err})
        test.ok(!e, 'no error')
        var post = cadigan.new.args[0][0]
        test.deepEqual(post.tags, [
            'gaslark:humbug',
            'fiend$!bocarce',
            '123934-p.   alphabet'
        ], 'see proper tags')
        test.equal(post.title, 'title', 'see title')
        test.done()
    }
}

exports.test_edit = {
    setUp: common_setup,
    test_bad_args: function(test) {
        var e
        cli.edit([], function(err) {e=err})
        test.ok(e, 'saw error')
        test.done()
    },
    test_success_overwrite: function(test) {
        var e
        cli.__set__('readline', {
            createInterface: function() {
                return {
                    question: function(p, cb) {
                        if (p.match(/title/)) {
                            cb('NEW TITLE!')
                        }
                        else { cb('some,tags') }
                    },
                    close: m.noop
                }
            }
        })
        cli.edit([123], function(err) {e=err})
        var post = cadigan.update.args[0][1]
        test.equal(post.content, 'thundering clap', 'new content')
        test.equal(post.title, 'NEW TITLE!', 'reset title')
        test.deepEqual(post.tags, ['some', 'tags'], 'see new tags')
        test.ok(post.published, 'still published')

        test.done()
    },
    test_success_only_content: function(test) {
        var e
        cli.__set__('readline', {
            createInterface: function() {
                return {
                    question: function(p, cb) { cb('') },
                    close: m.noop
                }
            }
        })
        cli.edit([123], function(err) {e=err})
        var post = cadigan.update.args[0][1]
        test.equal(post.title, 'great title', 'title unchanged')
        test.deepEqual(post.tags, ['hi', 'there'], 'tags unchanged')
        test.ok(post.published, 'still published')
        test.equal(post.content, 'thundering clap', 'content changed')

        test.done()
    }
}

exports.test_search_and_list = {
    setUp: function(cb) {
        this.mock_cliff = {
            putObjectRows: m.create_func()
        }
        cli.__set__('cliff', this.mock_cliff)
        cli.__set__('cadigan', cadigan)
        cb()
    },
    test_bad_args: function(test) {
        var e
        cli.search([], function(err) {e=err})
        test.ok(e, 'saw error')
        test.done()
    },
    test_no_results: function(test) {
        cadigan.search = m.create_func({func:function(keyword, cb) { cb(null, []) }})
        cli.search(['hello'], function(err) {
            test.equal(this.mock_cliff.putObjectRows.calls, 1, 'called putobjectrows')
            var results = this.mock_cliff.putObjectRows.args[0][1]
            test.deepEqual(results, [], 'no results passed to cliff')

            test.done()
        }.bind(this))
    },
    test_results: function(test) {
        cadigan.search = m.create_func({func:function(keyword, cb) { cb(null, [1,2,3]) }})
        cli.search(['hello'], function(err) {
            test.equal(this.mock_cliff.putObjectRows.calls, 1, 'called putobjectrows')
            var results = this.mock_cliff.putObjectRows.args[0][1]
            test.deepEqual(results, [1,2,3], 'results passed to cliff')

            test.done()
        }.bind(this))
    }
}

exports.test_publish = {
    setUp: function(cb) {
        cb()
    },
    test_bad_args: function(test) {
        test.done()
    },
    test_success: function(test) {
        test.done()
    }
}

var test_delete = {
}
