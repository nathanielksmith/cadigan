var async = require('async'),
    consolidate = require('consolidate'),
    express = require('express'),
    hash = require('node_hash'),
    wmd = require('wmd'),
    _ = require('underscore'),
    models = require('../lib/models')

require('functional-node').load().install()

var Posts = models.Posts,
    Post = models.Post,
    Authdata = models.Authdata,
    Metadata = models.Metadata

var app = express()
app.use(express.bodyParser())
app.use(express.static(__dirname+'/../front'))
app.use(express.favicon())

app.engine('.html', id)
app.engine('.xml', consolidate.mustache)
app.set('views', __dirname+'/../front')

var ensure_auth = function(req, res, next) {
    var auth = new Authdata()
    auth.fetch({
        error: function(m, e) { next(e) },
        success: function(auth) {
            var un = auth.get('username'),
                pw = auth.get('password')
            if (un === req.body.username && pw === req.body.password) next()
            else res.send(403)
        })
    })
}

// index
app.get('/', function(req, res) {
    res.render('index.html')
})

// feeds
var mkfeed = function(cb) {
    var datefmt = function(ts) {
        return String(new Date(ts*1000))
    },
    updated = String(new Date()),
    year = (new Date()).getYear() + 1900,
    domain = app.get('domain'),
    port = app.get('port')

    if (port && port !== 80)
        domain = domain+':'+post

    var mkcb = function(cls) {
        return function(cb) {
            var model = new cls
            model.fetch({
                error: function(m,e) { cb(e) },
                success: function(m) { cb(null, m) }
            })
        }
    }

    async.parallel({
        meta: mkcb(Metadata),
        posts: mkcb(Posts)
    }, function(err, results) {
        posts = results.posts
            .filter(function(p) {
                return p.publish
            })
            .map(function(p) {
                return _(p.attributes).extend({
                    content: wmd(p.get('content')),
                    created: datefmt(p.get('created')),
                    updated: datefmt(p.get('updated')),
                })
            })
        context = {
            name: results.meta.get('site_name'),
            posts: posts,
            domain: domain,
            author: results.meta.get('author_name') || 'cadigan user',
            updated: updated,
            year: year
        }
        app.render('feed.xml', context, cb)
    })
}

var update_feed = function() {
    mkfeed(function(err, xml) {
        console.error(err)
        app.set('feed', xml)
    })
}

app.get('/feed', function(req, res) {
    if (app.get('feed')) {
        res.send(app.get('feed'))
    }
    else {
        mkfeed(function(err, xml) {
            var resp = xml
            if (err) console.error(err)
            res.send(err ? 500 : xml)
            app.set('feed', xml)
        })
    }
}

app.post('/api/check-auth', function(req, res) {
    un = req.body.username
    pw = req.body.password

    (new Authdata).fetch({
        error: function(m,e) { console.error(e); res.send(500) },
        success: function(auth) {
            if (un !== auth.get('username') || pw !== auth.get('password')) {
                res.send(400)
            }
            else {
                res.send({ username:un, password:pw })
            }
        }
    })
})
