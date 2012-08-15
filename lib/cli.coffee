child_process = require 'child_process'
fs = require 'fs'
readline = require 'readline'
os = require 'os'

ds = require 'docstore'
cliff = require 'cliff'

cadigan = require '../lib/cadigan'
cadigan_server = require '../lib/server'

# TODO wrap cadigan.* methods with the commands below

cadigan =
    editor: (filename, cb) ->
        command = process.env['EDITOR'] or 'vim'
        child_process.spawn(command,[filename],{customFds:[0,1,2]}).on('exit',cb)

    start: (args, cb) ->
        hostname = args[0] or 'localhost'
        port = args[1] or '8105'
        cadigan_server.start(hostname, port, cb)

    temp_filename: -> "#{os.tmpDir()}/cadigan_tmp#{Math.random()}.markdown"
    new: (args, cb) ->
        console.log 'new called'
        if args.length < 1
            cb('no title provided', this)
        title = args[0]
        filename = self.temp_filename()
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
                    cadigan.new(post, (err, doc) =>
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
        cadigan.publish(id, (err, doc) =>
            throw err if err
            console.log doc._id
            cb(null, this)
        )
    edit: (args, cb) ->
        console.log 'edit called'
        if args.length < 1
            throw 'need post id'
        id = args[0]
        this.store.get(id, (err, doc) =>
            filename = self.temp_filename()
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
                            cadigan.update(id, doc, (err, doc) =>
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
        if args.length < 1
            throw 'need post id'
        id = args[0]
        cadigan.delete(id, (err) =>
            throw err if err
            console.log "deleted #{id}"
            cb(null, this)
        )
    search: (args, cb) ->
        throw 'need keyword' if args.length < 1
        keyword = args[0]
        cadigan.search(keyword, (err, docs) =>
            throw err if err
            cliff.putObjectRows('data', docs, ['_id', 'title'])
            cb(null, this)
        )
    list: (args, cb) ->
        cadigan.list((err, docs) =>
            throw err if err
            cliff.putObjectRows('data', docs, ['_id', 'title'])
            cb(null, this)
        )
    usage: -> 'usage'

exports.init = (cb) -> cadigan.init(cb)
