var fs = require('fs'),
    ds = require('docstore'),
    _ = require('underscore')

var noop = function() {},
    cond = function(c, t, f, p) {
        return c(p) ?  t(p) : f(p)
    },
    p = function(f) {
        var outer_args = Array.prototype.slice.call(arguments, 1)
        return function() {
            var inner_args = _.toArray(arguments)
            return f.apply(this, outer_args.concat(inner_args))
        }
    }

module.exports = {
    init: function(cb) {
        this.cadigan_path = process.env['HOME']+"/.cadigan"
        this.docstore_path = this.cadigan_path+"/docstore"
        ;[this.cadigan_path, this.docstore_path]
            .forEach(p(cond, fs.existsSync, noop, fs.mkdirSync))
        ds.open(this.docstore_path, function(err, store) {
            if (err) return cb(err)
            this.store = store
            ;['auth', 'meta'].forEach(function(x) {
                this['get_'+x] = p(this.store.get, x)
                this['set_'+x] = p(this.store.save, x)
            }.bind(this))
            this.get_post = this.store.get
            cb(null)
        }.bind(this))
    },
    now: function() { return Date.now() / 1000 },
    'new': function(post, cb) {
        var post_clone = _.clone(post)
        post_clone.created = this.now()
        post_clone.updated = this.now()
        this.store.save(post_clone, function(err, doc) {
            if (err) return cb(err)
            post.created = doc.created
            post.updated = doc.updated
            post._id = doc._id
            cb(null, doc)
        })
    },
    publish: function(post_id, cb) {
        // TODO    
    }

}
