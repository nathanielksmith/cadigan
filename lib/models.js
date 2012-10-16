var bb = require('backbone'),
    ds = require('docstore'),
    _ = require('underscore')

var DOCPATH = process.env['HOME']+'/.cadigan/docstore'
// TODO
//if (window) {
//    module = {exports:{}}
//    window.cadigan_models = module.exports
//}

var CadiganModel = bb.Model.extend({
    idAttribute: '_id',
    // TODO alternative for browser
    sync: function(method, model, options) {
        var success_cb = options.success || noop
        var error_cb = options.error || noop
        ds.open(DOCPATH, function(err, store) {
            if (err) return error_cb(err)
            if (method === 'read') {
                store.get(model.get('_id'), function(err, doc) {
                    if (err) return error_cb(err)
                    model.set(doc)
                    success_cb(model)
                })
            }
            else if (method === 'create') {
                var doc = model.attributes
                store.save(doc, function(err, doc) {
                    if (err) return error_cb(err)
                    model.set(doc)
                    success_cb(model)
                })
            }
            else if (method === 'update') {
                store.get(model.get('_id'), function(err, doc) {
                    if (err) return error_cb(err)
                    _.extend(doc, model.attributes)
                    store.save(doc, function(err, doc) {
                        model.set(doc)
                        success_cb(model)
                    })
                })
            }
            else if (method === 'delete') {
                store.remove(model.get('_id'), function(err) {
                    if (err) return error_cb(err)
                    success_cb(model)
                })
            }
        })
    }
})

var Metadata = CadiganModel.extend({
    initialize: function() { this.set('_id') = 'meta' }
})
var Authdata = CadiganModel.extend({
    initialize: function() { this.set('_id') = 'auth' }
})
var Authored = CadiganModel.extend({
    defaults: {
        published:false
    }
})

var Page = Authored.extend({
})

var Post = Authored.extend({
    urlRoot: '/posts/'
})

var Posts = bb.Collection.extend({
    initialize: function() {
        this.toJSON = function() {
            return this.models.map(function(x) { return x.toJSON() })
        }
    },
    model: Post,
    url: '/posts/',
    comparator: function(post) { return post.get('created') },
    // TODO alternative sync for browser
    sync: function(method, collection, options) {
        var success_cb = options.success || noop
        var error_cb = options.error || noop
        ds.open(DOCPATH, function(err, store) {
            if (err) return error_cb(err)
            store.scan(function(post) {
                return !_(['meta', 'auth']).contains(post._id)
            }, function(err, posts) {
                if (err) return error_cb(err)
                success_cb(posts)
            }.bind(this))
        }.bind(this))
    }
})

module.exports = {
    Metadata:Metadata,
    Authdata: Authdata,
    Post: Post,
    Authored:Authored,
    Posts:Posts
}
