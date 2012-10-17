(function() {
    var Post = models.Post,
        Posts = models.Posts

    var PublicCadiganRouter = Backbone.Router.extend({
        routes: {
            'posts/:id': 'post_by_id',
            'login': 'login'
        },
        initialize: function() {
            this.route(/\/?/, 'main', this.main);
        },
        login: function() {
            console.log('in login')
        },
        main: function() {
            var posts = new Posts,
                view = new PublicPostsView({collection: posts})
            posts.fetch()
        },
        post_by_id: function(id) {
            console.log('in post')
        }
    })

    var AdminCadiganRouter = Backbone.Router.extend({
        routes: {
            'admin': 'admin'
        },
        admin: function() { console.log('in admin') }
    })

    var PublicPostsView = Backbone.View.extend({
        tagName: 'div',
        className: 'public',
        id:'posts',
        initialize: function(opts) {
            var posts_tmpl = Hogan.compile($('#posts_tmpl').html())
            this.template = function(context, partials) {
                return posts_tmpl.render(context, partials)
            }
            this.collection = opts.collection
            this.collection.on('reset', this.render.bind(this))
        },
        render: function() {
            var posts = this.collection.filter(
                function(p){return p.get('published')}
            ).map(function(p){return p.attributes})

            this.$el.html(this.template({posts:posts}))
            $('#main').append(this.$el)
        }
    })

    new PublicCadiganRouter
    new AdminCadiganRouter

    Backbone.history.start({pushState:false})
}).apply(window)
