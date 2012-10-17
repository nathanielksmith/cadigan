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
        },
        login: function() {
            console.log('in login')
        },
        main: function() {
            // TODO BUG can't do meta in main, dummy. plz use partials.
            var posts = new Posts,
            //    post = new Post
                meta = new Metadata

            this.posts_view = new PublicPostsView({
                collection: posts,
                el: $('#posts')
            }),
            this.public_view = new PublicView({
                model: meta,
                el: $('#public')
            })
            //this.post_view = new PublicPostView({
            //    model: post
            //})
            meta.fetch()
            posts.fetch()
        },
        post_by_id: function(id) {
            this.posts_view.render(id)
        }
    })

    var AdminCadiganRouter = Backbone.Router.extend({
        routes: {
            'admin': 'admin'
        },
        admin: function() { console.log('in admin') }
    })

    var mktemplate = function(tmpl) {
        return function(context,partials) {
            return tmpl.render(context,partials)
        }
    }

    var PublicPostView = Backbone.View.extend({
        initialize: function(opts) {
            this.model = opts.model
            this.template = mktemplate(Hogan.compile($("#post_tmpl").html()))
        }
    })

    var PublicPostsView = Backbone.View.extend({
        initialize: function(opts) {
            this.el = opts.el
            var posts_tmpl = Hogan.compile($('#posts_tmpl').html())
            this.template = function(context, partials) {
                return posts_tmpl.render(context, partials)
            }
            this.collection = opts.collection
            this.collection.on('reset', this.render.bind(this))
        },
        render: function(c, xhr, id) {
            var posts = this.collection.filter(
                function(p){return p.get('published')}
            )
            if (id) {
                posts = posts.filter(function(p){return p.get("_id") === id})
            }
            posts = posts.map(function(p){return p.attributes})

            $('#posts').replaceWith(this.$el.html(this.template({posts:posts})))
        }
    })

    var PublicView = Backbone.View.extend({
        initialize: function(opts) {
            var public_tmpl = Hogan.compile($('#public').html())
            this.template = function(context, partials) {
                return public_tmpl.render(context,partials)
            }
            this.el = opts.el
            this.model = opts.model
            this.model.on('change', this.render.bind(this))
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON())).show()
        }
    })

    new PublicCadiganRouter
    new AdminCadiganRouter

    Backbone.history.start({pushState:false})
}).apply(window)
