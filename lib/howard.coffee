child_process = require 'child_process'
fs = require 'fs'
os = require 'os'

ds = require 'docstore'
cliff = require 'cliff'

howard_path = "#{process.env['HOME']}/.howard"

settings =
    docstore_path:  "#{howard_path}/docstore"

howard =
    editor: (filename, cb) ->
        command = process.env['EDITOR'] or 'vim'
        child_process.spawn(command,[filename],{customFds:[0,1,2]}).on('exit',cb)

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
        if args.length < 1
            cb('no title provided', this)
        title = args[0]
        filename = "#{os.tmpDir()}/howard_tmp#{Math.random()}.markdown"
        this.editor(filename, (code) =>
            throw 'editor failed' if code isnt 0
            fs.readFile(filename, (err, data) =>
                throw err if err
                content = data.toString()
                this.store.save({title:title, content:content}, (err, doc) =>
                    throw err if err
                    console.log doc._id
                    cb(null, this)
                )
            )
        )
    publish: (args, cb) ->
        console.log 'publish called'
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
