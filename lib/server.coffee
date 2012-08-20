readline = require 'readline'

async = require 'async'
express = require 'express'
hash = require 'node_hash'

cadigan = (require '../lib/cadigan').cadigan

app = express()
app.use express.bodyParser()
app.use express.static "#{__dirname}/../front"
app.use express.favicon()


# TODO cadigan middleware for init

app.engine('.html', (str) -> str)

ensure_auth = (req, res, next) ->
    cadigan.init((err) ->
        cadigan.store.get('auth', (err, doc) ->
            if doc.username == req.body.username and doc.password == req.body.password
                next()
            else
                res.send 403
        )
    )

# index
app.get('/', (req,res) -> res.render 'index.html')

# check-auth
app.post('/api/check-auth', (req, res) ->
    username = req.body.username
    password = req.body.password
    cadigan.init((err) ->
        cadigan.store.get('auth', (err, doc) ->
            if err
                console.error err
                return res.send 500
            if username != doc.username or password != doc.password
                res.send 400
            else
                res.send username:username, password:password
        )
    )
)

app.get('/api/meta', (req, res) ->
    cadigan.init((err) ->
        cadigan.meta((err, meta) ->
            res.send if err then 500 else meta
        )
    )
)

# get
app.get('/api/post', (req, res) ->
    cadigan.init((err) ->
        cadigan.get(req.body.post_id, (err, doc) ->
            res.send if err then 500 else doc
        )
    )
)

# search
app.get('/api/search', (req, res) ->
    cadigan.init((err) ->
        cadigan.search(req.keyword, (err, docs) ->
            res.send if err then 500 else docs
        )
    )
)

# fetch
app.get('/api/posts', (req, res) ->
    cadigan.init((err) ->
        res.send 500 if err
        cadigan.list((err, posts) ->
            res.send posts
        )
    )
)

# delete
app.delete('/api/post', ensure_auth, (req, res) ->
    console.log req.body
    cadigan.init((err) ->
        cadigan.delete(req.body.post_id, (err) ->
            res.send if err then 500 else 200
        )
    )
)

# new
app.post('/api/post', ensure_auth, (req, res) ->
    console.log req.body
    cadigan.init((err) ->
        post =
            title: req.body.title
            tags: req.body.tags
            content: req.body.content
        cadigan.new(post, (err, post) ->
            res.send if err then 500 else post
        )
    )
)

# publish
app.post('/api/publish', ensure_auth, (req, res) ->
    console.log req.body
    cadigan.init((err) ->
        cadigan.publish(req.body.post_id, (err) ->
            res.send if err then 500 else 200
        )
    )
)

# unpublish
app.post('/api/unpublish', ensure_auth, (req, res) ->
    console.log req.body
    cadigan.init((err) ->
        cadigan.unpublish(req.body.post_id, (err) ->
            res.send if err then 500 else 200
        )
    )
)

# update (editing)
app.post('/api/update', ensure_auth, (req, res) ->
    console.log req.body
    cadigan.init((err) ->
        cadigan.update(req.body.post_id, req.body.newness, (err) ->
            res.send if err then 500 else 200
        )
    )
)

exports.start = (hostname, port) ->
    cadigan.init((err) ->
        cadigan.store.get('auth', (err, doc) ->
            start = ->
                hostname = hostname or 'localhost'
                port = port or 3000
                app.listen(port, hostname)
                console.log "cadigan listening at #{hostname}:#{port}"
            if err
                # generate auth, save
                rl = readline.createInterface(
                    input:process.stdin
                    output:process.stdout
                )
                rl.write("looks like you need to set up this site.\n")
                async.series(
                    username: (cb) -> rl.question 'username? ', (answer) -> cb null, answer
                    password: (cb) -> rl.question 'password? ', (answer) -> cb null, answer
                    site_name: (cb) -> rl.question 'site name? ', (answer) -> cb null, answer
                , (err, input) ->
                    throw err if err
                    auth =
                        _id: 'auth'
                        username: input.username
                        password: hash.sha256(input.password)
                    cadigan.store.save(auth, (err, doc) ->
                        throw err if err
                        meta =
                            _id: 'meta'
                            site_name:input.site_name
                        cadigan.store.save(meta, (err, doc) ->
                            rl.write("got you down as #{input.username}\n")
                            rl.write("your site is called #{input.site_name}\n")
                            rl.close
                            start()
                        )
                    )
                )
            else
                start()
        )
    )
