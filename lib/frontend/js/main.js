(function() {
    var Post = models.Post,
        Posts = models.Posts,
        Metadata = models.Metadata

    var templates = {}
    ;['post', 'header', 'posts', 'admin_posts'].forEach(function(x) {
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
            'admin/posts': 'posts'
        },
        initialize: function() {
            var posts = new Posts
            this.apsview = new AdminPostsView({
                el: $('#admin_posts'),
                template: templates.admin_posts,
                collection: posts
            })
        },
        admin: function() {
            $("#public").hide()
            $("#admin").show()
            this.apsview.$el.hide()
        },
        posts: function() {
            $("#public").hide()
            $("#admin").show()
            this.apsview.collection.fetch().success(this.apsview.render.bind(this.apsview))
        }
    })

    var PostsView = Backbone.View.extend({
        initialize: function(opts) {
            this.el = opts.el
            this.template = opts.template
            this.collection = opts.collection
        }
    })

    var AdminPostsView = PostsView.extend({
        delegateEvents: {
            'keydown input[name=filter]': 'filter',
            'keyup input[name=filter]': 'filter'
        },
        filter: function(e) {
            var $filter = $('input[name=filter]')
            var keyword = $filter.val()
            if (!keyword) $('tr.post').show()
            $('tr.post').each(function() {
                var $tr = $(this)
                if (Boolean($tr.text().match(keyword))) $tr.show()
                else $tr.hide()
            })
        },
        render: function() {
            this.$el.html(this.template.render({posts:this.collection.map(function(p){return p.attributes})})).show()
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

    new PublicCadiganRouter
    new AdminCadiganRouter

    Backbone.history.start({pushState:false})
}).apply(window)
