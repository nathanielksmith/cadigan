var m = require('akeley')
var rewire = require('rewire')

var cli = require('../lib/cli')

var cli = rewire('../lib/cli')
cli.__set__('fs', {
    readFile: function(filename, cb) {
        cb(null, 'thundering clap')
    }
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

exports.test_new = {
    setUp: function(cb) {
        cli.__set__('cadigan', cadigan)
        cadigan.new.reset()
        cli.editor = function(filename, cb) { cb(0) }

        cb()
    },
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

var test_edit = {
}

var test_search_and_list = {
}

var test_publish = {
}

var test_delete = {
}
