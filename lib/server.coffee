express = require 'express'

cadigan = require '../lib/cadigan'

app = express()
app.configure(->
    app.use(express.logger())
    app.use(express.favicon())
    app.use(express.cookieParser())
    app.use(express.bodyParser())
    app.use(express.session({secret: 'wastrel trumpet', store: new RedisStore}))

app.get('/', 
