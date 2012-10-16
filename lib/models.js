var bb = require('backbone'),
    _ = require('underscore')

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
                store.get(model._id, function(err, doc) {
                    if (err) return error_cb(err)
                    model.set(doc)
                    success_cb(model)
                })
            }
            else if (method === 'create') {
                var doc = model.attributes
                doc._id = model._id
                store.save(doc, function(err, doc) {
                    if (err) return error_cb(err)
                    model.set(doc)
                    success_cb(model)
                })
            }
            else if (method === 'delete') {
                store.remove(model._id, function(err) {
                    if (err) return error_cb(err)
                    success_cb(model)
                })
            }
        })
    }
})

var Metadata = CadiganModel.extend({
    initialize: function() { this._id = 'meta' }
})
var Authdata = CadiganModel.extend({
    initialize: function() { this._id = 'auth' }
})
var Authored = CadiganModel.extend({
    initialize: function() {
        this.set('published', false)
    }
})
var Post = Authored.extend({
})

var Page = Authored.extend({
})

var Posts = bb.Collection.extend({
    model: Post,
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
