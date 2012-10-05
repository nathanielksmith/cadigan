var child_process = require('child_process')
var fs = require('fs')
var readline = require('readline')
var os = require('os')

var _ = require('underscore')
var async = require('async')
var cliff = require('cliff')

// TODO fix imports
var cadigan = require('../lib/cadigan').cadigan
var start_server = require('../lib/server').start

var ewrap = function (f) {
    return function() { 
        var args = _.toArray(arguments)
        if (args[0]) { throw args[0] }
        return f.apply(this, args.slice(1))
    }
}

Function.prototype.p = function() {
    var outer_args = _.toArray(arguments)
    var f = this
    return function() {
        return f.apply(this, outer_args.concat(_.toArray(arguments)))
    }
}

var questions = function(prompts, outer_cb) {
    var rl = readline.createInterface({
        input:process.stdin, output:process.stdout
    })
    async.mapSeries(_(prompts).values(), function(x, cb) {
        rl.question(x, cb.bind(null, null))
    }, function(err, answers) {
        rl.close()
        outer_cb(err, _(prompts).keys().zipk(answers))
    })
}

Array.prototype.zipk = function(b) {
    var _zip = function(a, b, c) {
        if (a.length === 0) { return c }
        c[a[0]] = b[0]
        return _zip(a.slice(1), b.slice(1), c)
    }
    return _zip(this, b, {})
}

var cli = {
    init: cadigan.init.bind(cadigan),
    editor: function (filename, cb) {
        command = process.env['EDITOR'] || 'vim'
        console.log(command)
        child_process.spawn(command, [filename], {
            customFds:[0,1,2]
        }).on('exit', cb)
    },
    start: function(args, cb) {
        hostname = args[0] || 'localhost'
        port = args[1] || 3000
        start_server(hostname, port)
        cb(null)
    },
    tmp_filename: function() {
        return os.tmpDir() +'/cadigan_tmp'+Math.random()+'.markdown'
    },
    new: function(args, cb) {
        if (args.length < 1) { return cb('no title provided') }
        var title = args[0],
            filename = this.tmp_filename(),
            self = this
        this.editor(filename, function(code) {
            if (code != 0) { return cb('editor failed') }
            fs.readFile(filename, function(err, data) {
                if (err) { return cb(err) }
                var content = data.toString()
                questions({tags:'tags? '}, function(err, answers) {
                    var tags = []
                    if (answers.tags) { tags = self.split_tags(answers.tags) }

                    var post = {
                        title: title,
                        content: content,
                        tags: tags,
                        published: false
                    }
                    cadigan.new(post, function(err, doc){
                        if (err) { return cb(err) }
                        console.log(doc._id)
                        cb(null)
                    })
                })
            })
        })
    },
    publish: function(args, cb) {
        if (args.length < 1) { return cb('need post id') }
        cadigan.publish(args[0], ewrap(cb.p(null)))
    },
    split_tags: function(tags) {
        if (!tags) { return [] }
        return tags.split(',').filter(function(x) {
            return x.length > 0
        })
    },
    edit: function(args, cb) {
        if (args.length < 1) { return cb('need post id') }
        var id = args[0]
        var self = this
        cadigan.get(id, function(err, doc) {
            var filename = self.tmp_filename()
            fs.writeFileSync(filename, doc.content)
            self.editor(filename, function(code) {
                if (code != 0) { throw 'editor failed' }
                fs.readFile(filename, function(err, data) {
                    if (err) {throw 'err reading tmpfile'}
                    doc.content = data.toString()
                    prompts = {
                        tags: 'tags? ['+doc.tags.join(',')+']',
                        title: 'title? ['+doc.title+']'
                    }
                    questions(prompts, function(err,answers){
                        if (answers.tags) { doc.tags = self.split_tags(answers.tags) }
                        if (answers.title) { doc.title = answers.title }
                        cadigan.update(id, doc, function(err) {
                            if (err) { throw err }
                            console.log(doc._id)
                            cb(null)
                        })
                    })
                })
            })
        })
    },
    delete: function(args, cb) {
        if (args.length < 1) { throw 'need post id' }
        cadigan.delete(args[0], ewrap(cb.p(null)))
    },
    search: function(args, cb) {
        if (args.length < 1) { return cb('need keyword') }
        cadigan.search(args[0], function(err, docs) {
            if (err) { return cb(err) }
            cliff.putObjectRows('data', docs, ['_id', 'title'])
            cb(null)
        })
    },
    usage: function() { return 'TODO' }
}

module.exports = cli
