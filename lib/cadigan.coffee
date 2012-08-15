# central object that Does Stuff. abstracted, just talks to docstore.
_ = require('underscore')

cadigan =
    init: (cb) ->
        this.cadigan_path = "#{process.env['HOME']}/.cadigan"
        this.docstore_path =  "#{cadigan_path}/docstore"
        unless fs.existsSync(cadigan_path)
            fs.mkdirSync(cadigan_path)
        unless fs.existsSync(settings.docstore_path)
            fs.mkdirSync(settings.docstore_path)

        ds.open(settings.docstore_path, (err, store) =>
            throw err if err
            this.store = store
            cb(null, this)
        )

    now: -> Date.now() / 1000

    new: (post, cb) ->
        post.created = this.now()
        post.updated = this.now()
        this.store.save(post, (err, doc) =>
            return cb(err) if err
            cb(null, doc)
        )

    publish: (post_id, cb) ->
        this.store.get(post_id, (err, doc) =>
            return cb(err, this) if err
            doc.published = true
            this.store.save(doc, (err, doc) =>
                return cb(err) if err
                cb(null, doc)
            )
        )

    update: (post_id, newness, cb) ->
        doc.updated = this.now()
        this.store.get(post_id, (err, doc) =>
            return cb(err) if err
            _.extend(doc, newness)
            this.store.save(doc, (err, doc) =>
                return cb(err) if err
            )
        )

    delete: (post_id, cb) -> this.store.remove(id, cb)

    search: (keyword, cb) ->
        filter = (doc) ->
            # check title, content, tags
            check = [doc.title, doc.content]
            check = check.concat(doc.tags) if doc.tags
            check.reduce((p,c) -> p or c.match(keyword) , false)
        this.store.scan(filter, cb)

    list: this.store.scan((->true), cb)
