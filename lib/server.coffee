readline = require 'readline'
cadigan = (require '../lib/cadigan').cadigan

express = require 'express'

app = express()
app.use express.bodyParser()

# get
app.get('/api/post', (req, res) ->
)

# search
app.get('/api/search', (req, res) ->
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
app.delete('/api/post', (req, res) ->
    console.log req.body
    res.send 200
)

# new
app.post('/api/post', (req, res) ->
    console.log(req.body)
    res.send 200
)

# publish
app.post('/api/publish', (req, res) ->
    console.log(req.body)
    res.send 200
)

# unpublish
app.post('/api/unpublish', (req, res) ->
    console.log(req.body)
    res.send 200
)

# update (editing)
app.post('/api/update', (req, res) ->
    console.log(req.body)
    res.send 200
)

exports.start = (hostname, port) ->
    cadigan.init((err) ->
        cadigan.store.get('auth', (err, doc) ->
            throw err if err
            start = ->
                hostname = hostname or 'localhost'
                port = port or 3000
                app.listen(port, hostname)
                console.log "cadigan listening at #{hostname}:#{port}"
            if not doc
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
                            password: password
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
