(function() {
    var Post = models.Post,
        Posts = models.Posts,
        Metadata = models.Metadata

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
                el: $('#posts'),
                template: templates.posts
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
        routes: { 
            'admin': 'admin',
            'admin/posts': 'posts',
            'admin/posts/new': 'new',
            'admin/posts/edit/:id': 'edit',
            'admin/posts/unpublish/:id': 'unpublish',
            'admin/posts/publish/:id':'publish',
            'admin/posts/delete/:id': 'delete'
        },
        initialize: function() {
            this.apsview = new AdminPostsView({collection:new Posts})
            this.new_view = new AdminWriteView()
        },
        admin: function() {
            $("#public").hide()
            $("#admin").show()
            $('#workspace').children().hide()
        },
        posts: function() {
            $("#public").hide()
            $("#admin").show()
            $('#workspace').children().hide()
            this.apsview.collection.fetch()
        },
        'new': function() {
        },
        edit: function(id) {
            $("#public").hide()
            $("#admin").show()
            $('#workspace').children().hide()
            var post = new Post({_id:id})
            this.edit_view = new AdminWriteView({model:post})
            post.fetch()
        },
    })

    var PostsView = Backbone.View.extend({
        initialize: function(opts) {
            this.el = opts.el
            this.template = opts.template
            this.collection = opts.collection
        }
    })

    var PublicPostsView = PostsView.extend({
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

    var CadiganApp = {
        models: models,
        pub_router: new PublicCadiganRouter,
        admin_router: new AdminCadiganRouter
    }
    window.CadiganApp = CadiganApp

    Backbone.history.start({pushState:false})
}).apply(window)
