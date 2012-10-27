var express = require('express')
require('functional-node').load().install()

var models = require('./models'),
    Post = models.Post,
    Posts = models.Posts,
    Metadata = models.Metadata

var models_js = require('fs').readFileSync('./models.js').toString()

var app = express()
app.use(express.bodyParser())
app.use(express.static(__dirname+'/frontend'))
app.use(express.favicon())

app.engine('.html', id)

app.get('/', function(req,res) {
    res.render('index.html')
})

app.get('/js/models.js', function(req, res) { res.send(models_js) })

app.get((new Posts).url(), function(req, res) {
    var posts = new Posts
    posts.fetch({
        error: function(m,e) { console.error(e); res.send(500) },
        success: function(posts) {
            res.send(posts.toJSON())
        }
    })
})

// TODO can store these urls on the model? would be nice...
app.get('/posts/:_id', function(req, res) {
    (new Post(req.params)).fetch({
        error: res.send.bind(res, 404),
        success: function(post) { res.send(post.toJSON()) }
    })
})
app.put('/posts/:_id', function(req, res) {
    var post = new Post(req.body)
    post.save(req.body, {
        error: res.send.bind(res, 500),
        success: function(model) { res.send(model.toJSON()) }
    })
})
app.post('/posts/', function(req, res) {
    var post = new Post(req.body)
    post.save(req.body, {
        error: res.send.bind(res, 500),
        success: function(model) { res.send(model.toJSON()) }
    })
})

app.delete('/posts/:_id', function(req, res) {
    (new Post(req.params)).destroy({
        error: res.send.bind(res, 500),
        success: res.send.bind(res, 200)
    })
})

var meta = new Metadata
app.get(meta.url(), function(req, res) {
    meta.fetch({
        error: function(m,e) { console.error(e); res.send(500) },
        success: function(meta) { res.send(meta.toJSON()) }
    })
})

app.listen(3000, 'localhost')
console.log('listening at localhost:3000')
