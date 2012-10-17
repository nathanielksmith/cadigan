var express = require('express')
require('functional-node').load().install()

var models = require('./models'),
    Post = models.Post,
    Posts = models.Posts,
    Metadata = models.Metadata

var app = express()
app.use(express.bodyParser())
app.use(express.static(__dirname+'/frontend'))
app.use(express.favicon())

app.engine('.html', id)

app.get('/', function(req,res) {
    res.render('index.html')
})

var posts = new Posts
app.get(posts.url(), function(req, res) {
    posts.fetch({
        error: function(m,e) { console.error(e); res.send(500) },
        success: function(posts) {
            res.send(posts.toJSON())
        }
    })
})

app.listen(3000, 'localhost')
console.log('listening at localhost:3000')
