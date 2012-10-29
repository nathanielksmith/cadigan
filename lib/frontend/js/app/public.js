(function() {
    var exports = {}

    var PublicRouter = Backbone.Router.extend({
        routes: {
            'posts/:id': 'post_by_id',
            'login': 'login'
        },
        initialize: function() {
            this.route(/^\/?$/, 'main', this.main);
            var posts = new Posts
            this.psview = new cadigan.views.pub.PublicPostsView({
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

    var PostsView = Backbone.View.extend({
        initialize: function(opts) {
            this.el = opts.el
            this.template = cadigan.templates.posts
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

    exports.PostsView = PostsView
    exports.MetaView = MetaView
    exports.PublicRouter = PublicRouter

    window.cadigan_public = exports

})()
