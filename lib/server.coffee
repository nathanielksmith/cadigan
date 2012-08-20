readline = require 'readline'


express = require 'express'
hash = require 'node_hash'

cadigan = (require '../lib/cadigan').cadigan

app = express()
app.use express.bodyParser()

# TODO cadigan middleware for init

ensure_auth = (req, res, next) ->
    cadigan.init((err) ->
        cadigan.store.get('auth', (err, doc) ->
            if doc.username == req.body.username and doc.password == req.body.password
                next()
            else
                res.send 403
        )
    )

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
        cadigan.unpublish(req.body.post_id, (err) ->
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
                rl.write("looks like you need to set up some auth.\n")
                rl.question('username? ', (username) ->
                    rl.question('password? ', (password) ->
                        auth =
                            _id: 'auth'
                            username: username
                            password: hash.sha256(password)
                        cadigan.store.save(auth, (err, doc)->
                            throw err if err
                            rl.write("got you down as #{username}\n")
                            rl.close
                            start()
                        )
                    )
                )
            else
                start()
        )
    )
