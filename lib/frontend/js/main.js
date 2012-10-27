(function() {
    var Post = models.Post,
        Posts = models.Posts,
        Metadata = models.Metadata

    var converter = new Showdown.converter();
    window.md2html = function(text) { return converter.makeHtml(text) }

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
            this.new_view = new AdminWriteView({$el: $('#admin_new')})
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
            $("#public").hide()
            $("#admin").show()
            $('#workspace').children().hide()
            this.new_view.render()
        },
        edit: function(id) {
            $("#public").hide()
            $("#admin").show()
            $('#workspace').children().hide()
            var post = new Post({_id:id})
            post.fetch().success(function() {
                console.log(post)
                this.edit_view = new AdminWriteView({model:post,$el:$('#admin_edit')})
                this.edit_view.render()
            }.bind(this))
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
            var raw_posts
            if (id) {
                raw_posts = posts.filter(function(p){
                    return p.get("_id") == id
                })
            }

            raw_posts = posts.map(function(p){
                return _(p.attributes).extend({
                    pretty_content: md2html(p.get('content')),
                    pretty_published_at: 'TODO'
                })
            })

            this.$el.html(this.template.render({posts:raw_posts}, {post:templates.post}))
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
