(function() {
    var PublicRouter = Backbone.Router.extend({
        // TODO need / view
        routes: {
            'posts/:id': 'post_by_id',
            'login': 'login'
        },
        initialize: function() {
            this.route(/^\/?$/, 'main', this.main);
            var posts = new CadiganApp.models.Posts
            this.psview = new PostsView({
                collection: posts,
                $el: $('#posts')
            })
        },
        login: function() {
            console.log('in login')
        },
        main: function() { // posts list
            debugger
            this.psview.collection.fetch().success(this.psview.render.bind(this.psview, null))
        },
        post_by_id: function(id) {
            this.psview.collection.fetch().success(this.psview.render.bind(this.psview, id))
        }
    })

    var PostsView = Backbone.View.extend({
        initialize: function(opts) {
            this.$el = opts.$el
            this.el = opts.$el[0]
            this.template = CadiganApp.templates.posts
            this.collection = opts.collection
        },
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
                    pretty_published_at: datefmt(p.get('published_at'))
                })
            })

            this.$el.html(this.template.render({posts:raw_posts}, {post:CadiganApp.templates.post}))
        }
    })

    var MetaView = Backbone.View.extend({
        initialize: function(opts) {
            this.el = opts.el
            this.model = opts.model
            this.template = CadiganApp.templates.header
            this.model.on('change', this.render.bind(this))
        },
        render: function() {
            this.$el.html(this.template.render(this.model.toJSON()))
        }
    })

    window.cadigan_public = {
        PostsView: PostsView,
        MetaView: MetaView,
        PublicRouter: PublicRouter
    }

})()
