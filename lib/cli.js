var child_process = require('child_process')
var fs = require('fs')
var readline = require('readline')
var os = require('os')

var _ = require('underscore'),
    bb = require('backbone'),
    async = require('async'),
    cliff = require('cliff'),
    hash = require('node_hash')

require('functional-node').load().install()

var models = require('../lib/models'),
    Authdata = models.Authdata,
    Metadata = models.Metadata,
    Post = models.Post,
    Posts = models.Posts

var start_server = require('../lib/server').start

var noop = function() {}
Array.prototype.zipk = function(b) {
    var _zip = function(a, b, c) {
        if (a.length === 0) { return c }
        c[a[0]] = b[0]
        return _zip(a.slice(1), b.slice(1), c)
    }
    return _zip(this, b, {})
}

var cli = {
    _questions: function(prompts, outer_cb) {
        var rl = readline.createInterface({
            input:process.stdin, output:process.stdout
        })
        async.mapSeries(_(prompts).values(), function(x, cb) {
            rl.question(x, cb.bind(null, null))
        }, function(err, answers) {
            rl.close()
            outer_cb(err, _(prompts).keys().zipk(answers))
        })
    },
    editor: function (filename, cb) {
        command = process.env['EDITOR'] || 'vim'
        child_process.spawn(command, [filename], {
            customFds:[0,1,2]
        }).on('exit', cb)
    },
    start: function(args, cb) {
        var self = this
        hostname = args[0] || 'localhost'
        port = args[1] || 3000
        var make_cb = function(cls) {
            return function(cb) {
                (new cls).fetch({
                    success: function(model) { cb(null, model) },
                    error: function(model, err) { err.code === 'ENOENT' ?  cb(null,null) : cb(err) }
                })
            }
        }
        async.parallel({
            auth: make_cb(Authdata),
            meta: make_cb(Metadata),
        }, function(err, results) {
            if (err) return cb(err)
            if (results.meta && results.auth) {
                return start_server(hostname, port, cb)
            }
            else {
                self._questions({
                    username: 'username? ',
                    password: 'password? ',
                    site_name: 'site name? ',
                    author_name: 'your name? '
                }, function(err, answers) {
                    if (err) return cb(err)
                    var auth = new Authdata({
                        username: answers.username,
                        password: hash.sha256(answers.password)
                    })
                    var meta = new Metadata({
                        site_name: answers.site_name,
                        author_name: answers.author_name
                    })
                    var save = function(model) {
                        return function(cb) {
                            model.save({}, {
                                success: function(model) { cb(null, model) },
                                error: function(model, err) { cb(err) }
                            })
                        }
                    }
                    async.parallel({meta:save(meta), auth:save(auth)}, function(err, results) {
                        if (err) return cb(err)
                        var auth = results.auth, meta = results.meta
                        process.stdout.write('got you down as '+auth.get('username')+'\n')
                        process.stdout.write('your site is called '+meta.get('site_name')+'\n')
                        process.stdout.write('your name is '+meta.get('author_name')+'\n')
                        start_server(hostname, port, cb)
                    })
                })
            }
        })
    },
    tmp_filename: function() {
        return os.tmpDir() +'/cadigan_tmp'+Math.random()+'.markdown'
    },
    new: function(args, cb) {
        var self = this
        if (args.length < 1) { return cb('no title provided') }
        var title = args[0],
            filename = self.tmp_filename()
        self.editor(filename, function(code) {
            if (code != 0) { return cb('editor failed') }
            fs.readFile(filename, function(err, data) {
                if (err) { return cb(err) }
                var content = data.toString()
                self._questions({tags:'tags? '}, function(err, answers) {
                    var tags = []
                    if (answers.tags) { tags = self.split_tags(answers.tags) }
                    var post = new Post({
                        title: title,
                        content: content,
                        tags: tags,
                        published: false
                    })
                    post.save({}, {
                        success: cb.curry(null),
                        error: function(m, err) { cb(err) }
                    })
                })
            })
        })
    },
    publish: function(args, cb) {
        if (args.length < 1) { return cb('need post id') }
        var post = new Post()
        post._id = args[0]
        post.fetch({
            success: function(model) {
                model.save({publish:true}, {
                    success: cb.curry(null),
                    error: function(m,e){cb(e)}
                })
            },
            error: function(m, err) { cb(err) }
        })
    },
    unpublish: function(args, cb) {
        if (args.length < 0) { return cb('need post id') }
        var post = new Post()
        post._id = args[0]
        post.save({published:false}, {
            error: function(m,e){cb(e)},
            success:function(model) {
                console.log(model._id)
                cb(null)
            }
        })
    },
    split_tags: function(tags) {
        if (!tags) { return [] }
        return tags.split(',').filter(function(x) {
            return x.length > 0
        })
    },
    edit: function(args, cb) {
        if (args.length < 1) { return cb('need post id') }
        var self = this,
            post = new Post()
        post._id = args[0]
        post.fetch({error: function(m,e) { cb(e) }, success: function(post) {
            var filename = self.tmp_filename()
            fs.writeFileSync(filename, post.get('content'))
            self.editor(filename, function(code) {
                if (code != 0) { return cb('editor failed') }
                fs.readFile(filename, function(err, data) {
                    if (err) {return cb('err reading tmpfile')}
                    post.set('content', data.toString())
                    prompts = {
                        tags: 'tags? ['+post.get('tags').join(',')+'] ',
                        title: 'title? ['+post.get('title')+'] '
                    }
                    self._questions(prompts, function(err,answers) {
                        if (answers.tags) { post.set('tags', self.split_tags(answers.tags)) }
                        if (answers.title) { post.set('title', answers.title) }
                        post.save(post.attributes, {
                            success: function(m) {
                                console.log(m._id)
                                cb(null)
                            },
                            error: function(m,err) { cb(err) }
                        })
                    })
                })
            })
        }})
    },
    delete: function(args, cb) {
        if (args.length < 1) { return cb('need post id') }
        // TODO this is clearly messed up:
        var post = new Post; post._id = args[0]; post.id = args[0]

        post.destroy({
            success: cb.curry(null),
            error: function(m,err) { cb(err) }
        })
    },
    search: function(args, cb) {
        if (args.length < 1) { return cb('need keyword') }
        var keyword = args[0]
        ;(new Posts).fetch({
            error: function(c, err) { cb(err) },
            success: function(posts) {
                var f = function(post) {
                    var check = [post.get('title'), post.get('content')]
                    if (post.has('tags')) { check = check.concat(post.get('tags')) }
                    var reductor = function(p,c) {
                        if (c) { return p || c.match(keyword) }
                        else { return false }
                    }
                    return check.reduce(reductor, false);
                }
                var attrs = function(p) { return p.attributes }
                cliff.putObjectRows('data', posts.filter(f).map(attrs), ['_id', 'title'])
            }
        })
    },
    list: function(args, cb) {
        (new Posts).fetch({
            error: function(c, err) { cb(err) },
            success: function(posts) {
                var attrs = function(p) { return p.attributes }
                cliff.putObjectRows('data', posts.map(attrs), ['_id', 'title'])
                cb(null)
            }
        })
    },
    usage: function() { return 'TODO' }
}

module.exports = cli
