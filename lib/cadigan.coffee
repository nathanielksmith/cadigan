# central object that Does Stuff. abstracted, just talks to docstore.
fs = require 'fs'

_ = require('underscore')
ds = require('docstore')

cadigan =
    init: (cb) ->
        this.cadigan_path = "#{process.env['HOME']}/.cadigan"
        this.docstore_path =  "#{this.cadigan_path}/docstore"
        unless fs.existsSync(this.cadigan_path)
            fs.mkdirSync(this.cadigan_path)
        unless fs.existsSync(this.docstore_path)
            fs.mkdirSync(this.docstore_path)

        ds.open(this.docstore_path, (err, store) =>
            throw err if err
            this.store = store
            cb(null, this)
        )

    now: -> Date.now() / 1000
    meta: (cb) -> this.store.get('meta', cb)

    new: (post, cb) ->
        post.created = this.now()
        post.updated = this.now()
        this.store.save(post, (err, doc) =>
            return cb(err) if err
            cb(null, doc)
        )

    get: (post_id, cb) -> this.store.get(post_id, cb)

    publish: (post_id, cb) ->
        this.store.get(post_id, (err, doc) =>
            return cb(err, this) if err
            doc.published = true
            this.store.save(doc, (err, doc) =>
                return cb(err) if err
                cb(null, doc)
            )
        )

    unpublish: (post_id, cb) ->
        this.store.get(post_id, (err, doc) =>
            return cb(err, this) if err
            doc.published = false
            this.store.save(doc, (err, doc) =>
                return cb(err) if err
                cb(null, doc)
            )
        )
    update: (post_id, newness, cb) ->
        this.store.get(post_id, (err, doc) =>
            doc.updated = this.now()
            return cb(err) if err
            _.extend(doc, newness)
            this.store.save(doc, (err, doc) =>
                return cb(err) if err
                cb(null, doc)
            )
        )

    delete: (post_id, cb) -> this.store.remove(post_id, cb)

    search: (keyword, cb) ->
        filter = (doc) ->
            # check title, content, tags
            return false if doc._id == 'auth' or doc._id == 'meta'
            check = [doc.title, doc.content]
            check = check.concat(doc.tags) if doc.tags
            reductor = (p,c) -> if c then p or c.match(keyword) else false
            check.reduce(reductor, false)
        this.store.scan(filter, cb)

    list: (cb) -> this.store.scan((doc) ->
        doc._id != 'auth' and doc._id != 'meta'
    , cb)

exports.cadigan = cadigan
