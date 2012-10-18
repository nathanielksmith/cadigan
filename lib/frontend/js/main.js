(function() {
    var Post = models.Post,
        Posts = models.Posts,
        Metadata = models.Metadata

    var templates = {}
    ;['post', 'header', 'posts'].forEach(function(x) {
        templates[x] = Hogan.compile($("#"+x+"_tmpl").text())
    })

    var PublicCadiganRouter = Backbone.Router.extend({
        routes: {
            'posts/:id': 'post_by_id',
            'login': 'login'
        },
        initialize: function() {
            this.route(/^\/?$/, 'main', this.main);
            var posts = new Posts
            this.psview = new PublicPostsView({
                collection: posts,
                el: $('#posts')
            })
        },
        login: function() {
            console.log('in login')
        },
        main: function() { // posts list
            this.psview.collection.fetch().success(this.psview.render.bind(this.psview, null))
        },
        post_by_id: function(id) {
            this.psview.collection.fetch().success(this.psview.render.bind(this.psview, id))
        }
    })

    var AdminCadiganRouter = Backbone.Router.extend({
        routes: { 'admin': 'admin' },
        admin: function() { console.log('in admin') }
    })

    var PublicPostsView = Backbone.View.extend({
        initialize: function(opts) {
            this.el = opts.el
            this.template = templates.posts
            this.collection = opts.collection
        },
        render: function(id) {
            var posts = this.collection.filter(
                function(p){return p.get('published')}
            )
            if (id) {
                posts = posts.filter(function(p){
                    return p.get("_id") == id
                })
            }
            posts = posts.map(function(p){return p.attributes})

            this.$el.html(this.template.render({posts:posts}, {post:templates.post}))
        }
    })

    var MetaView = Backbone.View.extend({
        initialize: function(opts) {
            this.el = opts.el
            this.model = opts.model
            this.template = templates.header
            this.model.on('change', this.render.bind(this))
        },
        render: function() {
            this.$el.html(this.template.render(this.model.toJSON()))
        }
    })

    var meta = new Metadata
    meta_view = new MetaView({ model:meta, el: $('#header') })
    meta.fetch()

    new PublicCadiganRouter
    new AdminCadiganRouter

    Backbone.history.start({pushState:false})
}).apply(window)
