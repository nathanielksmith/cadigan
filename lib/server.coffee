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
)

# update (editing)
app.post('/api/update', (req, res) ->
)

exports.start = (hostname, port) ->
    hostname = hostname or 'localhost'
    port = port or 3000
    app.listen(port, hostname)
    console.log "cadigan listening at #{hostname}:#{port}"
