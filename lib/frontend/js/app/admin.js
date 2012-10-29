(function() {
    var exports = {}

    var AdminRouter = Backbone.Router.extend({
        routes: { 
            'admin': 'admin',
            'admin/posts': 'posts',
            'admin/posts/new': 'new',
            'admin/posts/edit/:id': 'edit',
            'admin/posts/unpublish/:id': 'unpublish',
            'admin/posts/publish/:id':'publish',
            'admin/posts/delete/:id': 'delete'
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
            this.apsview = new AdminPostsView({collection:new Posts})
            this.apsview.collection.fetch()
        },
        'new': function() {
            $("#public").hide()
            $("#admin").show()
            $('#workspace').children().hide()
            this.new_view = new AdminWriteView({$el: $('#admin_new')})
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

    // TODO views

    exports.AdminRouter = AdminRouter

    window.cadigan_admin = exports

})()
