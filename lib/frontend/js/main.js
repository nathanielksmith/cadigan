(function() {
    var Post = models.Post,
        Posts = models.Posts

    var PublicCadiganRouter = Backbone.Router.extend({
        routes: {
            '': 'index',
            'posts/:id': 'post_by_id',
            'login': 'login'
        },
        login: function() {
            debugger;
        },
        main: function() {
            console.log('in main')
        },
        posts: function(id) {
            console.log('in post')
        }
    })

    var AdminCadiganRouter = Backbone.Router.extend({
        routes: {
            'admin': 'admin'
        },
        admin: function() { console.log('in admin') }
    })

    new PublicCadiganRouter
    new AdminCadiganRouter

    Backbone.history.start({pushState:true})
}).apply(window)
