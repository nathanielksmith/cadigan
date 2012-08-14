child_process = require 'child_process'
fs = require 'fs'
readline = require 'readline'
os = require 'os'

ds = require 'docstore'
cliff = require 'cliff'

cadigan = require '../lib/cadigan'
cadigan_server = require '../lib/server'

# TODO wrap cadigan.* methods with the commands below

cadigan_path = "#{process.env['HOME']}/.cadigan"

settings =
    docstore_path:  "#{cadigan_path}/docstore"

cadigan =
    editor: (filename, cb) ->
        command = process.env['EDITOR'] or 'vim'
        child_process.spawn(command,[filename],{customFds:[0,1,2]}).on('exit',cb)

    init: (cb) ->
        console.log 'init called'
        unless fs.existsSync(cadigan_path)
            fs.mkdirSync(cadigan_path)
        unless fs.existsSync(settings.docstore_path)
            fs.mkdirSync(settings.docstore_path)

        ds.open(settings.docstore_path, (err, store) =>
            throw err if err
            this.store = store
            cb(null, this)
        )

    start: (args, cb) ->
        cadigan_server.start(args, cb)

    new: (args, cb) ->
        console.log 'new called'
        if args.length < 1
            cb('no title provided', this)
        title = args[0]
        filename = "#{os.tmpDir()}/cadigan_tmp#{Math.random()}.markdown"
        this.editor(filename, (code) =>
            throw 'editor failed' if code isnt 0
            fs.readFile(filename, (err, data) =>
                throw err if err
                content = data.toString()
                rl = readline.createInterface(
                    input:process.stdin
                    output:process.stdout
                )
                rl.question('tags? ', (answer) =>
                    tags = if answer then answer.split(',') else []
                    rl.close()
                    now = Date.now() / 1000
                    post =
                        title:title
                        content:content
                        tags:tags
                        created:now
                        updated:now
                        published:false
                    console.log post
                    this.store.save(post, (err, doc) =>
                        throw err if err
                        console.log doc._id
                        cb(null, this)
                    )
                )
            )
        )
    publish: (args, cb) ->
        console.log 'publish called'
        if args.length < 1
            throw 'need post id'
        id = args[0]
        this.store.get(id, (err, doc) =>
            throw err if err
            doc.published = true
            this.store.save(doc, (err, doc) =>
                throw err if err
                console.log doc._id
                cb(null, this)
            )
        )
        cb(null, this)
    edit: (args, cb) ->
        console.log 'edit called'
        if args.length < 1
            throw 'need post id'
        id = args[0]
        this.store.get(id, (err, doc) =>
            filename = "#{os.tmpDir()}/cadigan_tmp#{Math.random()}.markdown"
            fs.writeFileSync(filename, doc.content)
            this.editor(filename, (code) =>
                throw 'editor failed' if code isnt 0
                fs.readFile(filename, (err, data) =>
                    doc.content = data.toString()
                    rl = readline.createInterface(
                        input:process.stdin
                        output:process.stdout
                    )
                    rl.question("tags? [#{doc.tags.join(', ')}]", (answer) =>
                        doc.tags = if answer then answer.split(',') else doc.tags
                        rl.question("title? [#{doc.title}] ", (answer) =>
                            doc.title = answer or doc.title
                            rl.close()
                            this.store.save(doc, (err, doc) =>
                                throw err if err
                                console.log doc._id
                                cb(null, this)
                            )
                        )
                    )
                )
            )
        )
    delete: (args, cb) ->
        console.log 'delete called'
        if args.length < 1
            throw 'need post id'
        id = args[0]
        this.store.remove(id, (err) =>
            console.log "deleted #{id}"
            cb(null, this)
        )
    search: (args, cb) ->
        console.log 'delete called'
        if args.length < 1
            throw 'need keyword'
        keyword = args[0]
        filter = (doc) ->
            # check title, content, tags
            check = [doc.title, doc.content]
            check = check.concat(doc.tags) if doc.tags
            check.reduce((p,c) ->
                p or c.match(keyword)
            , false)
        this.store.scan(filter, (err, docs) =>
            throw err if err
            cliff.putObjectRows('data', docs, ['_id', 'title'])
            cb(null, this)
        )
    list: (args, cb) ->
        console.log 'list called'
        this.store.scan((->true), (err, docs) =>
            throw err if err
            cliff.putObjectRows('data', docs, ['_id', 'title'])
            cb(null, this)
        )
    usage: -> 'usage'

exports.init = (cb) -> cadigan.init(cb)
