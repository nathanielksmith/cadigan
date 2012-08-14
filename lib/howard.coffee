fs = require 'fs'

ds = require 'docstore'
cliff = require 'cliff'

howard_path = "#{process.env['HOME']}/.howard"

settings =
    docstore_path:  "#{howard_path}/docstore"

howard =
    init: (cb) ->
        console.log 'init called'
        unless fs.existsSync(howard_path)
            fs.mkdirSync(howard_path)
        unless fs.existsSync(settings.docstore_path)
            fs.mkdirSync(settings.docstore_path)

        ds.open(settings.docstore_path, (err, store) =>
            throw err if err
            this.store = store
            cb(null, this)
        )

    new: (args, cb) ->
        console.log 'new called'
        cb(null, this)
    edit: (args, cb) ->
        console.log 'edit called'
        cb(null, this)
    delete: (args, cb) ->
        console.log 'delete called'
        cb(null, this)
    search: (args, cb) ->
        console.log 'delete called'
        cb(null, this)
    usage: -> 'usage'

exports.init = (cb) -> howard.init(cb)
